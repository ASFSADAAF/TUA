/** Backend ile iletişim; ağ hataları ve JSON edge-case. */

export async function fetchConfig() {
  const base = "";
  const url = `${base}/api/config`;
  let res;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" } });
  } catch (e) {
    throw new Error(
      "Sunucuya bağlanılamadı. `npm start` ile çalıştırıp http://localhost:3000 kullanın."
    );
  }
  if (!res.ok) {
    throw new Error(`Yapılandırma alınamadı (${res.status})`);
  }
  const data = await res.json().catch(() => ({}));
  return {
    mapsApiKey: typeof data.mapsApiKey === "string" ? data.mapsApiKey : "",
    aiAvailable: Boolean(data.aiAvailable),
    copernicusConfigured: Boolean(data.copernicusConfigured),
    yoloScript: Boolean(data.yoloScript),
    autoGeminiAfterRoute: Boolean(data.autoGeminiAfterRoute),
    geminiModelsHint:
      typeof data.geminiModelsHint === "string" ? data.geminiModelsHint : "",
  };
}

export async function fetchHealth() {
  try {
    const r = await fetch("/api/health", { headers: { Accept: "application/json" } });
    if (!r.ok) return { ok: false };
    return await r.json();
  } catch {
    return { ok: false };
  }
}

async function postAi(path, prompt) {
  let res;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ prompt }),
    });
  } catch (e) {
    throw new Error(e?.message || "Ağ hatası");
  }
  const raw = await res.text();
  let data;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error("Geçersiz sunucu yanıtı");
  }
  if (!res.ok) {
    throw new Error(data?.error || `AI isteği başarısız (${res.status})`);
  }
  if (typeof data.text !== "string" || !data.text) {
    throw new Error("Boş AI yanıtı");
  }
  return data.text;
}

export function analyzeDisasterPrompt(zonesDesc, routeDesc) {
  return `Sen bir afet yönetimi ve kurtarma lojistiği uzmanısın. Aşağıdaki verilere göre kurtarma ekiplerine Türkçe, maddeli ve kısa bir durum raporu üret.

HASAR BÖLGELERİ:
${zonesDesc || "Veri yok"}

ROTA VE ÖLÇÜMLER:
${routeDesc}

İstenen çıktı (3–5 madde): genel durum, en kritik bölge, güvenli güzergah değerlendirmesi, acil öncelikler. Maksimum 200 kelime; abartılı kesinlik iddiasından kaçın.`;
}

export function quickQuestionPrompt(zonesSummary, question) {
  return `Afet yönetimi bağlamında kısa ve net yanıt ver (Türkçe, en fazla 150 kelime).
Hasar bölgeleri özeti: ${zonesSummary}
Soru: ${question}`;
}

export async function aiAnalyze(prompt) {
  return postAi("/api/ai/analyze", prompt);
}

export async function aiChat(prompt) {
  return postAi("/api/ai/chat", prompt);
}

/** @param {{ source?: string, days?: number, minMagnitude?: number, limit?: number }} q */
export async function fetchEarthquakes(q = {}) {
  const p = new URLSearchParams();
  p.set("source", q.source || "usgs");
  if (q.days != null) p.set("days", String(q.days));
  else if ((q.source || "usgs") === "usgs") p.set("days", "30");
  if (q.minMagnitude != null) p.set("minMagnitude", String(q.minMagnitude));
  if (q.limit != null) p.set("limit", String(q.limit));
  let res;
  try {
    res = await fetch(`/api/earthquakes?${p}`, {
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    throw new Error(e?.message || "Ağ hatası");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Deprem API ${res.status}`);
  return data;
}

export async function fetchWaterRoute(from, to) {
  const base = "";
  const url = `${base}/api/water-route`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start: from, end: to }),
  });
  if (!res.ok) throw new Error(`Su rotası alınamadı (${res.status})`);
  return res.json();
}

export async function analyzeRouteWithAI(startLat, startLng, endLat, endLng, mapImage = null) {
  const base = "";
  const url = `${base}/api/ai/analyze-route`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startLat,
      startLng,
      endLat,
      endLng,
      mapImage
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `AI rota analizi başarısız (${res.status})`);
  }
  return res.json();
}
