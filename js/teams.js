/**
 * Çoklu kurtarma ekibi yönetimi.
 * Her ekip bir harita marker'ı + atanmış bölge + durum bilgisi taşır.
 */

const TEAM_COLORS = ["#22d3ee","#a78bfa","#fb923c","#34d399","#f472b6","#facc15","#60a5fa","#f87171"];

let _map = null;
let _teams = [];
let _teamIdCounter = 0;
let _onUpdate = null;

export function initTeams(map, onUpdate) {
  _map = map;
  _onUpdate = onUpdate;
}

export function getTeams() { return _teams; }

export function addTeam(name, lat, lng) {
  const id = ++_teamIdCounter;
  const color = TEAM_COLORS[(id - 1) % TEAM_COLORS.length];
  const marker = new google.maps.Marker({
    position: { lat, lng },
    map: _map,
    title: name,
    icon: {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 7,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#0f172a",
      strokeWeight: 1.5,
      rotation: 0,
    },
    zIndex: 50,
    label: {
      text: String(id),
      color: "#0f172a",
      fontSize: "10px",
      fontWeight: "700",
    },
  });

  const team = { id, name, lat, lng, color, marker, assignedZoneId: null, status: "hazır" };
  _teams.push(team);
  _onUpdate?.();
  return team;
}

export function removeTeam(id) {
  const idx = _teams.findIndex(t => t.id === id);
  if (idx === -1) return;
  _teams[idx].marker.setMap(null);
  _teams.splice(idx, 1);
  _onUpdate?.();
}

/**
 * Tüm ekiplere otomatik görev ata.
 * Her bölgeye en yakın atanmamış ekip gönderilir; çakışma olmaz.
 */
export function autoAssign(zones) {
  // Önce atamaları sıfırla
  _teams.forEach(t => { t.assignedZoneId = null; t.status = "hazır"; });

  // Öncelik sırası: high > medium > low, sonra hayatta kalma skoru
  const sorted = [...zones].sort((a, b) => {
    const sevOrder = { high: 0, medium: 1, low: 2 };
    const sd = (sevOrder[a.severity] ?? 2) - (sevOrder[b.severity] ?? 2);
    if (sd !== 0) return sd;
    return (b.survivalScore ?? 0) - (a.survivalScore ?? 0);
  });

  const assigned = new Set();
  const result = [];

  for (const zone of sorted) {
    // Bu bölgeye atanmamış en yakın ekibi bul
    let best = null, bestDist = Infinity;
    for (const team of _teams) {
      if (assigned.has(team.id)) continue;
      const d = haversineDeg(team.lat, team.lng, zone.lat, zone.lng);
      if (d < bestDist) { bestDist = d; best = team; }
    }
    if (!best) break;
    best.assignedZoneId = zone.id;
    best.status = "görevde";
    assigned.add(best.id);
    result.push({ team: best, zone });

    // Marker'ı bölgeye yönelt
    const bearing = calcBearing(best.lat, best.lng, zone.lat, zone.lng);
    best.marker.setIcon({
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 7,
      fillColor: best.color,
      fillOpacity: 1,
      strokeColor: "#0f172a",
      strokeWeight: 1.5,
      rotation: bearing,
    });
  }

  _onUpdate?.();
  return result;
}

export function clearTeams() {
  _teams.forEach(t => t.marker.setMap(null));
  _teams = [];
  _onUpdate?.();
}

// ── Yardımcılar ──────────────────────────────────────────────────────────────
function haversineDeg(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function calcBearing(lat1, lng1, lat2, lng2) {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1*Math.PI/180)*Math.sin(lat2*Math.PI/180) -
            Math.sin(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
