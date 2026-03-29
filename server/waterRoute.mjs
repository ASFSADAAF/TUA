/**
 * OpenStreetMap su unsurları (Overpass) üzerinde tekne güzergâhı.
 * Başlangıç/varış, en yakın su hattına snap edilir (sanal düğüm + kenar bölme).
 */
import { haversineKm } from "./geoUtil.mjs";

const VIRT_START = "__virt_start__";
const VIRT_END = "__virt_end__";
const SNAP_START = "__snap_start__";
const SNAP_END = "__snap_end__";

/** Su hattına maks. snapping mesafesi (km); kıyı / göl kenarı için biraz tolerans */
const MAX_SNAP_KM = 18;

function toKey(lat, lng) {
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

function addUndirectedEdge(adj, a, b, w) {
  const wt = Number(w);
  if (!a || !b || !(wt > 0) || !Number.isFinite(wt)) return;
  if (!adj.has(a)) adj.set(a, []);
  if (!adj.has(b)) adj.set(b, []);
  adj.get(a).push({ to: b, w: wt });
  adj.get(b).push({ to: a, w: wt });
}

/** @returns {Map<string, Array<{to:string,w:number}>>} */
function buildGraph(elements) {
  const adj = new Map();
  for (const el of elements || []) {
    if (el.type !== "way" || !Array.isArray(el.geometry) || el.geometry.length < 2)
      continue;
    const pts = el.geometry;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const k1 = toKey(p1.lat, p1.lon);
      const k2 = toKey(p2.lat, p2.lon);
      const w = haversineKm(p1.lat, p1.lon, p2.lat, p2.lon);
      if (w > 0) addUndirectedEdge(adj, k1, k2, w);
    }
  }
  return adj;
}

function parseKey(k) {
  const [lat, lng] = k.split(",").map(Number);
  return { lat, lng };
}

function pointSegmentDistanceKm(lat, lng, lat1, lng1, lat2, lng2) {
  const p = closestOnSegment(lat, lng, lat1, lng1, lat2, lng2);
  return haversineKm(lat, lng, p.lat, p.lng);
}

function closestOnSegment(lat, lng, lat1, lng1, lat2, lng2) {
  const dx = lat2 - lat1;
  const dy = lng2 - lng1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-18) return { lat: lat1, lng: lng1 };
  let u = ((lat - lat1) * dx + (lng - lng1) * dy) / lenSq;
  u = Math.max(0, Math.min(1, u));
  return { lat: lat1 + u * dx, lng: lng1 + u * dy };
}

/**
 * En yakın su segmenti ve grafikte var olan uç düğümler (k1, k2).
 * @returns {{ distKm: number, k1: string, k2: string, proj: {lat:number,lng:number} } | null}
 */
function nearestWaterEdge(lat, lng, adj) {
  let best = null;
  let db = Infinity;
  const seen = new Set();
  for (const [ka, neigh] of adj) {
    if (ka === VIRT_START || ka === VIRT_END || ka === SNAP_START || ka === SNAP_END)
      continue;
    for (const { to: kb } of neigh || []) {
      if (kb === VIRT_START || kb === VIRT_END || kb === SNAP_START || kb === SNAP_END)
        continue;
      const sig = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      const na = parseKey(ka);
      const nb = parseKey(kb);
      const d = pointSegmentDistanceKm(lat, lng, na.lat, na.lng, nb.lat, nb.lng);
      if (d < db) {
        db = d;
        const proj = closestOnSegment(lat, lng, na.lat, na.lng, nb.lat, nb.lng);
        best = { distKm: d, k1: ka, k2: kb, proj };
      }
    }
  }
  return best;
}

function dijkstra(adj, start, goal) {
  const dist = new Map();
  const prev = new Map();
  const pq = [{ k: start, d: 0 }];
  dist.set(start, 0);
  while (pq.length) {
    pq.sort((a, b) => a.d - b.d);
    const { k: u, d: du } = pq.shift();
    if (du > (dist.get(u) ?? 1e18)) continue;
    if (u === goal) break;
    for (const e of adj.get(u) || []) {
      const nd = du + e.w;
      if (nd < (dist.get(e.to) ?? 1e18)) {
        dist.set(e.to, nd);
        prev.set(e.to, u);
        pq.push({ k: e.to, d: nd });
      }
    }
  }
  if (!dist.has(goal)) return null;
  const path = [goal];
  let c = goal;
  while (c !== start && prev.has(c)) {
    c = prev.get(c);
    path.push(c);
  }
  if (c !== start) return null;
  path.reverse();
  return path;
}

/**
 * Sanal köprü: nokta → projeksiyon (snap düğümü) → su grafiğine gir.
 */
function attachPointToWater(adj, virtNode, snapNode, lat, lng) {
  const hit = nearestWaterEdge(lat, lng, adj);
  if (!hit || hit.distKm > MAX_SNAP_KM)
    return {
      ok: false,
      reason: `Başlangıç veya varış açık suya çok uzak (yaklaşık ${MAX_SNAP_KM} km içinde göl/nehir/kıyı hattı gerekir)`,
    };
  const pa = parseKey(hit.k1);
  const pb = parseKey(hit.k2);
  adj.set(snapNode, []);
  addUndirectedEdge(adj, snapNode, hit.k1, haversineKm(hit.proj.lat, hit.proj.lng, pa.lat, pa.lng));
  addUndirectedEdge(adj, snapNode, hit.k2, haversineKm(hit.proj.lat, hit.proj.lng, pb.lat, pb.lng));
  addUndirectedEdge(adj, virtNode, snapNode, haversineKm(lat, lng, hit.proj.lat, hit.proj.lng));
  return { ok: true };
}

function expandBboxAroundSegment(start, end, padDeg) {
  let south = Math.min(start.lat, end.lat) - padDeg;
  let north = Math.max(start.lat, end.lat) + padDeg;
  let west = Math.min(start.lng, end.lng) - padDeg;
  let east = Math.max(start.lng, end.lng) + padDeg;
  south = Math.max(south, -85);
  north = Math.min(north, 85);
  west = Math.max(west, -180);
  east = Math.min(east, 180);
  return { south, west, north, east };
}

/**
 * @param {{ lat: number, lng: number }} start
 * @param {{ lat: number, lng: number }} end
 */
export async function fetchWaterRoute(start, end) {
  const pad = 0.28;
  const { south, west, north, east } = expandBboxAroundSegment(start, end, pad);

  const q = `[out:json][timeout:120];
(
  way["waterway"~"river|stream|canal|tidal_channel|ditch|fairway|dock"](${`${south},${west},${north},${east}`});
  way["natural"="water"](${`${south},${west},${north},${east}`});
  way["natural"="bay"](${`${south},${west},${north},${east}`});
  way["natural"="strait"](${`${south},${west},${north},${east}`});
  relation["type"="multipolygon"]["natural"="water"](${`${south},${west},${north},${east}`});
);
(._;>;);
out geom;`;

  const r = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body: q,
  });
  if (!r.ok) throw new Error(`Overpass HTTP ${r.status}`);
  const gj = await r.json();
  const adj = buildGraph(gj.elements);
  if (adj.size === 0)
    return {
      path: null,
      approximate: true,
      reason: "Bu bölgede OSM su geometrisi yok — haritada iki noktayı göle/nehre yakın seçin.",
    };

  adj.set(VIRT_START, []);
  adj.set(VIRT_END, []);

  const a0 = attachPointToWater(adj, VIRT_START, SNAP_START, start.lat, start.lng);
  if (!a0.ok)
    return { path: null, approximate: true, reason: a0.reason };

  const a1 = attachPointToWater(adj, VIRT_END, SNAP_END, end.lat, end.lng);
  if (!a1.ok)
    return { path: null, approximate: true, reason: a1.reason };

  const keyPath = dijkstra(adj, VIRT_START, VIRT_END);
  if (!keyPath) {
    return {
      path: null,
      approximate: true,
      reason: "Seçilen iki nokta aynı su ağı üzerinde bağlanamıyor (ayrı havzalar / eksik OSM)",
    };
  }

  const midPts = [];
  for (const k of keyPath) {
    if (
      k === VIRT_START ||
      k === VIRT_END ||
      k === SNAP_START ||
      k === SNAP_END
    )
      continue;
    midPts.push(parseKey(k));
  }

  const withEnds = [{ ...start }, ...midPts, { ...end }];
  let distM = 0;
  for (let i = 0; i < withEnds.length - 1; i++) {
    distM +=
      haversineKm(
        withEnds[i].lat,
        withEnds[i].lng,
        withEnds[i + 1].lat,
        withEnds[i + 1].lng
      ) * 1000;
  }
  return { path: withEnds, approximate: false, distanceM: distM };
}
