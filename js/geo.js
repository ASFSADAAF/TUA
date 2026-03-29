/** Dünya yüzeyinde mesafe ve yardımcı geometri. */

const R_EARTH_KM = 6371;

export function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R_EARTH_KM * c;
}

/** Polyline üzerinde örnek noktalar (LatLng benzeri {lat,lng}). */
export function samplePolyline(points, maxSamples = 80) {
  if (!points?.length) return [];
  if (points.length <= maxSamples) return points.map((p) => ({ lat: p.lat(), lng: p.lng() }));
  const out = [];
  const step = (points.length - 1) / (maxSamples - 1);
  for (let i = 0; i < maxSamples; i++) {
    const idx = Math.round(i * step);
    const p = points[idx];
    out.push({ lat: p.lat(), lng: p.lng() });
  }
  return out;
}
