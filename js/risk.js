/**
 * Rota güvenliği: hasar bölgeleri (dairesel) ile polyline örtüşmesi ve yakınlık modeli.
 * Skor 0–100 (yüksek = daha güvenli güzergah).
 */
import { haversineKm } from "./geo.js";

const SEVERITY_WEIGHT = { high: 1.0, medium: 0.55, low: 0.28 };

function radiusM(sev) {
  if (sev === "high")   return 800;
  if (sev === "medium") return 400;
  return 150;
}

export function computeExposure(samples, zones) {
  if (!samples.length || !zones.length) return 0;
  let exposure = 0;
  for (const z of zones) {
    const Rkm = radiusM(z.severity) / 1000;
    const w = SEVERITY_WEIGHT[z.severity] ?? 0.3;
    let zoneSum = 0;
    for (const s of samples) {
      const d = haversineKm(s.lat, s.lng, z.lat, z.lng);
      if (d <= Rkm) {
        const inside = 1 - d / Math.max(Rkm, 1e-6);
        zoneSum += w * (0.65 + 0.35 * inside);
      } else {
        const over = d - Rkm;
        const decayKm = Math.max(Rkm * 0.85, 0.5);
        zoneSum += w * 0.35 * Math.exp(-over / decayKm);
      }
    }
    exposure += zoneSum / samples.length;
  }
  return exposure;
}

export function exposureToSafety01(exposure) {
  return Math.max(0, Math.min(100, 100 * Math.exp(-0.85 * exposure)));
}

export function safetyLabelTr(score) {
  if (score >= 78) return "Güvenli güzergah — çekirdek hasara minimal yakınlık";
  if (score >= 55) return "Orta risk — alternatif rota veya zamanlama değerlendirin";
  if (score >= 35) return "Dikkat — güzergah hasar yoğunluğuna yakın";
  return "Yüksek risk — mümkünse rota değiştirin veya bekleyin";
}
