/**
 * BKZS backend: Gemini (çoklu model), Gemini Vision hasar analizi, su rotası, Copernicus.
 */
import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import { fetchWaterRoute } from "./server/waterRoute.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "32mb" }));

const GEMINI_KEY = process.env.GEMINI_API_KEY?.trim();
const MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY?.trim();
const COPERNICUS_ID = process.env.COPERNICUS_CLIENT_ID?.trim();
const COPERNICUS_SECRET = process.env.COPERNICUS_CLIENT_SECRET?.trim();
const AUTO_GEMINI_AFTER_ROUTE =
  String(process.env.GEMINI_AUTO_AFTER_ROUTE || "").toLowerCase() === "true";

function geminiModelList() {
  const raw = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatGeminiClientError(raw) {
  const s = String(raw || "");
  if (/quota|429|RESOURCE_EXHAUSTED|limit:\s*0|exceeded your current quota/i.test(s)) {
    return (
      "Gemini kotası veya ücretsiz model erişimi kapalı. Google AI Studio’da plan/faturalama kontrol edin: " +
      "https://ai.google.dev/gemini-api/docs/rate-limits — .env örneği: " +
      "GEMINI_MODELS=gemini-2.5-flash-lite-preview,gemini-2.0-flash-lite,gemini-1.5-flash-8b,gemini-1.5-flash " +
      "(sizin hesabınızda hangisi açıksa onu başa yazın). Orijinal ileti: " +
      s.slice(0, 400)
    );
  }
  return s;
}

async function callGeminiModels(parts, multimodal = false) {
  if (!GEMINI_KEY) {
    const err = new Error("GEMINI_API_KEY tanımlı değil");
    err.status = 503;
    throw err;
  }
  const models = geminiModelList();
  let lastMsg = "Model yanıt vermedi";
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model
    )}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: multimodal
          ? [{ role: "user", parts }]
          : [{ parts }],
      }),
    });
    const data = await r.json().catch(() => ({}));
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (r.ok && text) return { text, model };
    lastMsg = data?.error?.message || `Gemini HTTP ${r.status}`;
    continue;
  }
  const err = new Error(formatGeminiClientError(lastMsg));
  err.status = 429;
  throw err;
}

async function callGeminiText(prompt) {
  const { text } = await callGeminiModels([{ text: prompt }], false);
  return text;
}


const SATELLITE_IMAGE_W = 640;
const SATELLITE_IMAGE_H = 640;

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(GEMINI_KEY),
    mapsConfigured: Boolean(MAPS_KEY),
    copernicusConfigured: Boolean(COPERNICUS_ID && COPERNICUS_SECRET),
    geminiModels: geminiModelList(),
  });
});

app.get("/api/config", (_req, res) => {
  res.json({
    mapsApiKey: MAPS_KEY || "",
    aiAvailable: Boolean(GEMINI_KEY),
    copernicusConfigured: Boolean(COPERNICUS_ID && COPERNICUS_SECRET),
    autoGeminiAfterRoute: AUTO_GEMINI_AFTER_ROUTE,
    geminiModelsHint: geminiModelList().join(", "),
  });
});

async function getCopernicusToken() {
  const r = await fetch(
    "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: COPERNICUS_ID,
        client_secret: COPERNICUS_SECRET,
      }),
    }
  );
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.access_token) {
    throw new Error(
      data.error_description || data.error || `Copernicus token HTTP ${r.status}`
    );
  }
  return data.access_token;
}

const KAHRAMANMARAS_BBOX = [36.82, 37.28, 37.42, 37.78];
const TRUE_COLOR_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: [{
      bands: ["B04", "B03", "B02"],
      units: "REFLECTANCE",
    }],
    output: {
      id: "default",
      bands: 3,
      sampleType: "UINT8",
    },
  };
}
function evaluatePixel(sample) {
  var g = 3.5;
  return [
    Math.min(255, sample.B04 * 255 * g),
    Math.min(255, sample.B03 * 255 * g),
    Math.min(255, sample.B02 * 255 * g),
  ];
}`;

async function fetchSentinelTrueColorPng(token, fromIso, toIso) {
  const body = {
    input: {
      bounds: {
        bbox: KAHRAMANMARAS_BBOX,
        properties: { crs: "http://www.opengis.net/def/crs/EPSG/0/4326" },
      },
      data: [
        {
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: { from: fromIso, to: toIso },
            maxCloudCoverage: 80,
          },
        },
      ],
    },
    output: {
      width: SATELLITE_IMAGE_W,
      height: SATELLITE_IMAGE_H,
      responses: [{ identifier: "default", format: { type: "image/png" } }],
    },
    evalscript: TRUE_COLOR_EVALSCRIPT,
  };
  const r = await fetch("https://sh.dataspace.copernicus.eu/api/v1/process", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "image/png",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Copernicus process ${r.status}: ${t.slice(0, 400)}`);
  }
  const buf = Buffer.from(await r.arrayBuffer());
  return buf.toString("base64");
}

app.get("/api/earthquakes", async (req, res) => {
  const source = (req.query.source || "usgs").toLowerCase();
  const minMag = Number(req.query.minMagnitude) || 2.5;
  const limit = Math.min(Number(req.query.limit) || 40, 200);
  try {
    if (source === "afad") {
      const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 60);
      const end = new Date();
      const start = new Date(end.getTime() - days * 86400000);
      const fmt = (d) => d.toISOString().slice(0, 10);
      const url = `https://deprem.afad.gov.tr/apiv2/event/filter?start=${fmt(
        start
      )}&end=${fmt(end)}`;
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        return res.status(502).json({
          error: `AFAD HTTP ${r.status}`,
          detail: t.slice(0, 200),
        });
      }
      const rows = await r.json();
      const list = Array.isArray(rows) ? rows : [];
      const features = list
        .filter((e) => Number(e.magnitude) >= minMag)
        .slice(0, limit)
        .map((e) => ({
          lat: parseFloat(e.latitude),
          lng: parseFloat(e.longitude),
          mag: Number(e.magnitude),
          place: e.location || e.province || "—",
          time: e.date,
          id: String(e.eventID || e.date || Math.random()),
        }))
        .filter((f) => !Number.isNaN(f.lat) && !Number.isNaN(f.lng));
      return res.json({ source: "afad", features });
    }

    const usgsUrl = new URL(
      "https://earthquake.usgs.gov/fdsnws/event/1/query"
    );
    usgsUrl.searchParams.set("format", "geojson");
    usgsUrl.searchParams.set("minlatitude", "35");
    usgsUrl.searchParams.set("maxlatitude", "43");
    usgsUrl.searchParams.set("minlongitude", "25");
    usgsUrl.searchParams.set("maxlongitude", "46");
    usgsUrl.searchParams.set("minmagnitude", String(minMag));
    usgsUrl.searchParams.set("orderby", "time");
    usgsUrl.searchParams.set("limit", String(limit));
    const daysUsgs = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    const endU = new Date();
    const startU = new Date(endU.getTime() - daysUsgs * 86400000);
    usgsUrl.searchParams.set("starttime", startU.toISOString());
    usgsUrl.searchParams.set("endtime", endU.toISOString());
    const r = await fetch(usgsUrl.toString());
    if (!r.ok)
      return res.status(502).json({ error: `USGS HTTP ${r.status}` });
    const gj = await r.json();
    const features = (gj.features || []).map((f) => {
      const p = f.properties || {};
      const c = f.geometry?.coordinates || [];
      return {
        lng: c[0],
        lat: c[1],
        mag: p.mag,
        place: p.place || "—",
        time: p.time,
        id: f.id || p.code || String(p.time),
      };
    });
    return res.json({ source: "usgs", features });
  } catch (e) {
    res.status(500).json({ error: e.message || "Deprem verisi alınamadı" });
  }
});

app.get("/api/satellite/kahramanmaras-pair", async (_req, res) => {
  if (!COPERNICUS_ID || !COPERNICUS_SECRET) {
    return res.status(503).json({
      ok: false,
      error:
        "Copernicus kimlik bilgisi yok. .env içine COPERNICUS_CLIENT_ID ve COPERNICUS_CLIENT_SECRET ekleyin (Data Space).",
    });
  }
  try {
    const token = await getCopernicusToken();
    const beforeB64 = await fetchSentinelTrueColorPng(
      token,
      "2023-02-06T00:00:00.000Z",
      "2023-02-06T23:59:59.999Z"
    );
    const afterB64 = await fetchSentinelTrueColorPng(
      token,
      "2023-02-09T00:00:00.000Z",
      "2023-02-09T23:59:59.999Z"
    );
    res.json({
      ok: true,
      labelBefore: "2023-02-06 (Sentinel-2 L2A, gerçek renk)",
      labelAfter: "2023-02-09 (Sentinel-2 L2A, gerçek renk)",
      bbox: KAHRAMANMARAS_BBOX,
      imageWidth: SATELLITE_IMAGE_W,
      imageHeight: SATELLITE_IMAGE_H,
      imageBefore: beforeB64,
      imageAfter: afterB64,
    });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message || "Copernicus isteği başarısız" });
  }
});

app.post("/api/route/water", async (req, res) => {
  try {
    const { start, end } = req.body || {};
    if (!start?.lat || !start?.lng || !end?.lat || !end?.lng)
      return res.status(400).json({ error: "start ve end {lat,lng} gerekli" });
    const out = await fetchWaterRoute(
      { lat: Number(start.lat), lng: Number(start.lng) },
      { lat: Number(end.lat), lng: Number(end.lng) }
    );
    res.json(out);
  } catch (e) {
    res.status(502).json({ error: e.message || "Su rotası başarısız" });
  }
});

app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "prompt gerekli" });
    }
    const text = await callGeminiText(prompt.trim());
    res.json({ text });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ error: e.message || "Sunucu hatası" });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "prompt gerekli" });
    }
    const text = await callGeminiText(prompt.trim());
    res.json({ text });
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ error: e.message || "Sunucu hatası" });
  }
});


app.post("/api/ai/analyze-route", async (req, res) => {
  try {
    const { startLat, startLng, endLat, endLng, mapImage } = req.body || {};
    
    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({ error: "Başlangıç ve varış koordinatları gerekli" });
    }
    
    if (!GEMINI_KEY) {
      return res.status(503).json({ error: "GEMINI_API_KEY tanımlı değil" });
    }

    let analysisText = "";
    let provider = "gemini_text";
    
    if (mapImage && typeof mapImage === "string") {
      // Harita görüntüsü desteği kaldırıldı - sadece metin analizi
      console.log("Harita görüntüsü alındı ancak sadece metin analizi yapılacak");
    }

    // Sadece koordinatlarla metin analizi
    try {
      analysisText = await callGeminiText(
        `Başlangıç: (${Number(startLat).toFixed(5)}, ${Number(startLng).toFixed(5)}) ile Varış: (${Number(endLat).toFixed(5)}, ${Number(endLng).toFixed(5)}) arasında afet bölgesi için güvenli rota analizi yap.
          
Görevler:
1. Bölgedeki olası riskleri değerlendir (deprem, sel vb.)
2. En güvenli rota koridorunu öner
3. Alternatif yolları listele
4. Güvenlik skorunu belirt (1-10)
5. Özel uyarıları ekle

Türkçe olarak yanıtla.`
      );
      provider = "gemini_text";
    } catch (e) {
      analysisText = "Gemini metin analizi başarısız: " + (e.message || "");
      provider = "gemini_text_error";
    }

    res.json({
      analysis: analysisText,
      provider,
      coordinates: {
        start: { lat: Number(startLat), lng: Number(startLng) },
        end: { lat: Number(endLat), lng: Number(endLng) }
      },
      timestamp: new Date().toISOString()
    });

  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ error: e.message || "Rota analizi başarısız" });
  }
});

app.use(express.static(__dirname, { extensions: ["html"] }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!MAPS_KEY) console.warn("UYARI: GOOGLE_MAPS_API_KEY boş — harita için .env doldurun.");
  if (!GEMINI_KEY) console.warn("UYARI: GEMINI_API_KEY boş — Gemini devre dışı.");
  console.log("Gemini model:", geminiModelList()[0]);
  if (!COPERNICUS_ID) console.warn("İpucu: COPERNICUS_CLIENT_ID/SECRET ile Kahramanmaraş uydu çifti açılır.");
});
