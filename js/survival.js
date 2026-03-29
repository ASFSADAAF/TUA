/**
 * Hayatta kalma tahmini zamanlayıcısı.
 * Afet başlangıç saatine göre geçen süreyi hesaplar ve
 * her bölge için hayatta kalma olasılığını günceller.
 *
 * Kaynak model (yaklaşık): Coburn & Spence (2002) deprem kurtarma eğrisi
 *   t=0h  → %91
 *   t=6h  → %74
 *   t=24h → %60
 *   t=48h → %30
 *   t=72h → %15
 *   t=96h → %5
 */

const SURVIVAL_CURVE = [
  { h: 0,  p: 91 },
  { h: 6,  p: 74 },
  { h: 24, p: 60 },
  { h: 48, p: 30 },
  { h: 72, p: 15 },
  { h: 96, p: 5  },
];

let _startTime = null;   // Date
let _tickInterval = null;
let _onTick = null;      // callback(elapsedH, survivalPct, urgencyLabel)

/** Afet saatini şimdi olarak başlat */
export function startSurvivalClock(onTick) {
  _startTime = new Date();
  _onTick = onTick;
  _tick();
  _tickInterval = setInterval(_tick, 10_000); // her 10 sn güncelle
}

/** Belirli bir tarih/saat ile başlat */
export function setSurvivalStart(dateObj, onTick) {
  _startTime = dateObj instanceof Date ? dateObj : new Date(dateObj);
  _onTick = onTick;
  _tick();
  if (_tickInterval) clearInterval(_tickInterval);
  _tickInterval = setInterval(_tick, 10_000);
}

export function stopSurvivalClock() {
  if (_tickInterval) clearInterval(_tickInterval);
  _tickInterval = null;
}

export function getElapsedHours() {
  if (!_startTime) return 0;
  return (Date.now() - _startTime.getTime()) / 3_600_000;
}

/** Geçen saate göre hayatta kalma % tahmini (interpolasyon) */
export function survivalPct(elapsedH) {
  const h = Math.max(0, elapsedH);
  for (let i = 0; i < SURVIVAL_CURVE.length - 1; i++) {
    const a = SURVIVAL_CURVE[i];
    const b = SURVIVAL_CURVE[i + 1];
    if (h >= a.h && h <= b.h) {
      const t = (h - a.h) / (b.h - a.h);
      return a.p + t * (b.p - a.p);
    }
  }
  if (h < SURVIVAL_CURVE[0].h) return SURVIVAL_CURVE[0].p;
  return SURVIVAL_CURVE[SURVIVAL_CURVE.length - 1].p;
}

export function urgencyLabel(pct) {
  if (pct >= 80) return { label: "KRİTİK — İlk altın saatler", color: "#f87171" };
  if (pct >= 60) return { label: "ACİL — Müdahale hızlandırılmalı", color: "#fb923c" };
  if (pct >= 30) return { label: "YÜKSEK — Her dakika önemli", color: "#fbbf24" };
  return { label: "DÜŞÜK — Uzun süreli kurtarma", color: "#94a3b8" };
}

function _tick() {
  if (!_onTick || !_startTime) return;
  const h = getElapsedHours();
  const pct = survivalPct(h);
  const urg = urgencyLabel(pct);
  _onTick(h, pct, urg);
}
