/**
 * BKZS uygulama girişi: harita, rota, risk, AI proxy.
 */
import {
  fetchConfig,
  fetchHealth,
  aiAnalyze,
  aiChat,
  analyzeDisasterPrompt,
  quickQuestionPrompt,
  fetchEarthquakes,
  fetchWaterRoute,
  analyzeRouteWithAI,
} from "./api.js";
import { samplePolyline, haversineKm } from "./geo.js";
import {
  computeExposure,
  exposureToSafety01,
  safetyLabelTr,
} from "./risk.js";
import { SCENARIOS, ZONE_RADII, ZONE_COLORS } from "./scenarios.js";
import {
  initClock,
  addMsg,
  removeMsg,
  renderDisasterList,
  setAlertHeader,
  setMapStatus,
  setAiChip,
} from "./ui.js";
import { initToplanmaAlanlari, TOPLANMA_ALANLARI, TIP_META } from "./assembly.js";

const AI_PANEL = "aiPanel";

const state = {
  map: null,
  directionsService: null,
  directionsRenderer: null,
  startMarker: null,
  endMarker: null,
  disasterCircles: [],
  disasterZones: [],
  cursorMode: "observe",
  startPos: null,
  endPos: null,
  gmKey: "",
  currentMode: "sim",
  aiAvailable: false,
  copernicusConfigured: false,
  customPolyline: null,
  geocoder: null,
  autoGeminiAfterRoute: false,
  toplanmaKatmani: null,
};

function $(id) {
  return document.getElementById(id);
}

/** Yol haritası modu için hafif stil; uydu/hibrit modda kullanılmaz. */
function lightMapStyles() {
  return [
    { elementType: "geometry", stylers: [{ color: "#eef1f6" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#5c6578" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#eef1f6" }] },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#e4e8f0" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#dadfe8" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#c6d4e8" }],
    },
  ];
}

function loadGoogleMapsScript(key) {
  if (window.google?.maps?.Map) {
    window.initMap();
    return;
  }
  if (document.querySelector("script[data-bkzs-maps]")) return;
  const s = document.createElement("script");
  // loading=async + marker kütüphanesi (AdvancedMarkerElement için zorunlu)
  s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
    key
  )}&libraries=geometry&callback=initMap&language=tr&loading=async`;
  s.async = true;
  s.defer = true;
  s.setAttribute("data-bkzs-maps", "1");
  s.onerror = () => {
    setMapStatus(false, "Harita hatası");
    addMsg(
      AI_PANEL,
      "error",
      "Google Maps betiği yüklenemedi. Anahtar ve ağınızı kontrol edin."
    );
  };
  document.head.appendChild(s);
}

function initMap() {
  const el = $("map");
  if (!el) return;
  state.map = new google.maps.Map(el, {
    center: { lat: 38.9637, lng: 35.2433 },
    zoom: 6,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DEFAULT,
      position: google.maps.ControlPosition.TOP_LEFT,
      mapTypeIds: [
        google.maps.MapTypeId.HYBRID,
        google.maps.MapTypeId.SATELLITE,
        google.maps.MapTypeId.ROADMAP,
        google.maps.MapTypeId.TERRAIN,
      ],
    },
    streetViewControl: false,
    fullscreenControl: true,
  });
  state.map.addListener("maptypeid_changed", () => {
    const t = state.map.getMapTypeId();
    if (t === "roadmap") state.map.setOptions({ styles: lightMapStyles() });
    else state.map.setOptions({ styles: null });
  });
  state.directionsService = new google.maps.DirectionsService();
  state.directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#0ea5e9",
      strokeWeight: 5,
      strokeOpacity: 0.92,
    },
  });
  state.directionsRenderer.setMap(state.map);
  setMapStatus(true, "Harita aktif");
  state.map.addListener("click", (e) => handleMapClick(e.latLng));

  try {
    state.geocoder = new google.maps.Geocoder();
  } catch {
    state.geocoder = null;
  }
  const searchForm = $("mapSearchForm");
  const searchInput = $("mapGeocodeInput");
  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      runMapPlaceSearch(searchInput.value);
    });
  }

  addMsg(
    AI_PANEL,
    "system",
    "Harita bağlantısı kuruldu. Senaryo seçin veya bölgeleri işaretleyin."
  );
  loadScenario();

  // Toplanma alanları
  try {
    state.toplanmaKatmani = initToplanmaAlanlari(state.map);
    renderAssemblyList();
    const cnt = $("assemblyCount");
    if (cnt) cnt.textContent = `${TOPLANMA_ALANLARI.length} alan`;
    // Başlangıçta checkbox checked ise hepsi görünür, değilse gizle
    if ($("chkAssemblyVisible")?.checked) {
      filterAssembly($("assemblySearch")?.value || "");
    } else {
      state.toplanmaKatmani.hideAll();
    }
  } catch (e) { console.warn("[Toplanma]", e.message); }
}
function runMapPlaceSearch(raw) {
  const q = String(raw || "").trim();
  if (!q) return;
  if (!state.map) return;
  if (!state.geocoder) {
    addMsg(AI_PANEL, "error", "Geocoder kullanılamıyor.");
    return;
  }
  const tid = addMsg(AI_PANEL, "system", "Konum aranıyor…");
  const finish = (results, status) => {
    removeMsg(tid);
    if (status !== "OK" || !results?.length) {
      addMsg(
        AI_PANEL,
        "error",
        status === "ZERO_RESULTS"
          ? "Sonuç yok — farklı anahtar kelime deneyin."
          : `Arama: ${status}`
      );
      return;
    }
    const r0 = results[0];
    const loc = r0.geometry?.location;
    if (!loc) return;
    const vp = r0.geometry.viewport;
    if (vp && vp.getNorthEast && vp.getSouthWest) state.map.fitBounds(vp);
    else {
      state.map.setCenter(loc);
      state.map.setZoom(11);
    }
    addMsg(AI_PANEL, "system", `Harita: ${r0.formatted_address || q}`);
  };
  state.geocoder.geocode(
    { address: q, componentRestrictions: { country: "tr" } },
    (results, status) => {
      if (status === "ZERO_RESULTS") {
        state.geocoder.geocode({ address: q }, finish);
        return;
      }
      finish(results, status);
    }
  );
}

window.initMap = initMap;

// ---------------------------------------------------------------------------
// TOPLANMA ALANLARI — Liste & Filtre
// ---------------------------------------------------------------------------
let _assemblyTipFilter = "";

function renderAssemblyList(query = "", tip = "") {
  const el = $("assemblyList");
  if (!el) return;
  const q = query.toLowerCase().trim();
  const filtered = TOPLANMA_ALANLARI.filter((a) => {
    const matchQ = !q || a.il.toLowerCase().includes(q) || a.ilce.toLowerCase().includes(q) || a.ad.toLowerCase().includes(q);
    const matchT = !tip || a.tip === tip;
    return matchQ && matchT;
  });
  const cnt = $("assemblyCount");
  if (cnt) cnt.textContent = `${filtered.length} alan`;
  if (!filtered.length) {
    el.innerHTML = `<div style="padding:10px 12px;color:#64748b;font-size:12px">Sonuç yok</div>`;
    return;
  }
  el.innerHTML = filtered.map((a) => {
    const meta = TIP_META[a.tip] || TIP_META.park;
    return `<div class="d-item" style="border-left:3px solid ${meta.color};cursor:pointer" data-aid="${a.id}">
      <span style="font-size:16px;margin-right:6px">${meta.icon}</span>
      <div class="d-info" style="flex:1;min-width:0">
        <div class="d-name" style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(a.ad)}</div>
        <div class="d-coords" style="font-size:11px;color:#64748b">${escapeHtml(a.il)} / ${escapeHtml(a.ilce)} · ~${a.kapasite.toLocaleString("tr-TR")} kişi</div>
      </div>
      <span style="font-size:10px;color:${meta.color};white-space:nowrap">${meta.label}</span>
    </div>`;
  }).join("");
  el.querySelectorAll("[data-aid]").forEach((row) => {
    row.addEventListener("click", () => {
      state.toplanmaKatmani?.zoomTo(row.dataset.aid);
    });
  });
}

function filterAssembly(query = "", tip = "") {
  if (tip !== undefined) _assemblyTipFilter = tip;
  renderAssemblyList(query, _assemblyTipFilter);
  if (!state.toplanmaKatmani) return;
  if (!$("chkAssemblyVisible")?.checked) return;
  const q = query.toLowerCase().trim();
  const t = _assemblyTipFilter;
  state.toplanmaKatmani.filter((a) => {
    const matchQ = !q || a.il.toLowerCase().includes(q) ||
      a.ilce.toLowerCase().includes(q) || a.ad.toLowerCase().includes(q);
    const matchT = !t || a.tip === t;
    return matchQ && matchT;
  });
}

// ---------------------------------------------------------------------------
// ŞEHİR / İLÇE GÜVENLİ ROTA
// ---------------------------------------------------------------------------

/** Şehir/ilçe adını Türkiye içinde geocode eder → {lat, lng} */
async function geocodeCity(name) {
  return new Promise((resolve, reject) => {
    if (!state.geocoder) return reject(new Error("Geocoder hazır değil"));
    const q = name.trim();
    if (!q) return reject(new Error("Boş yer adı"));

    // Önce Türkiye kısıtlamasıyla dene
    state.geocoder.geocode(
      { address: q, componentRestrictions: { country: "tr" } },
      (results, status) => {
        if (status === "OK" && results?.length) {
          const loc = results[0].geometry.location;
          return resolve({
            lat: loc.lat(),
            lng: loc.lng(),
            label: results[0].formatted_address || q,
          });
        }
        // Kısıtsız dene
        state.geocoder.geocode({ address: q }, (r2, s2) => {
          if (s2 === "OK" && r2?.length) {
            const loc = r2[0].geometry.location;
            return resolve({
              lat: loc.lat(),
              lng: loc.lng(),
              label: r2[0].formatted_address || q,
            });
          }
          reject(new Error(`"${q}" bulunamadı (${s2})`));
        });
      }
    );
  });
}

/** Şehir-şehir güvenli rota ana fonksiyonu */
async function findCityRoute() {
  const fromVal = $("cityFrom")?.value?.trim();
  const toVal = $("cityTo")?.value?.trim();
  const note = $("cityRouteNote");
  const btnAi = $("btnCityRouteAi");

  if (!fromVal || !toVal) {
    if (note) { note.textContent = "Başlangıç ve varış şehir/ilçe girin."; note.style.display = ""; }
    return;
  }
  if (!state.map) {
    if (note) { note.textContent = "Harita henüz yüklenmedi."; note.style.display = ""; }
    return;
  }

  if (note) note.style.display = "none";
  if (btnAi) btnAi.disabled = true;

  const tid = addMsg(AI_PANEL, "system", `"${escapeHtml(fromVal)}" → "${escapeHtml(toVal)}" geocode ediliyor…`);

  let fromPos, toPos;
  try {
    [fromPos, toPos] = await Promise.all([
      geocodeCity(fromVal),
      geocodeCity(toVal),
    ]);
    removeMsg(tid);
  } catch (e) {
    removeMsg(tid);
    addMsg(AI_PANEL, "error", e.message);
    if (note) { note.textContent = e.message; note.style.display = ""; }
    return;
  }

  addMsg(AI_PANEL, "system",
    `Başlangıç: ${escapeHtml(fromPos.label)}<br>Varış: ${escapeHtml(toPos.label)}`
  );

  // Koordinatları state'e yaz ve marker'ları güncelle
  setStartPoint(fromPos.lat, fromPos.lng);
  setEndPoint(toPos.lat, toPos.lng);

  // Haritayı iki nokta arasına sığdır
  const bounds = new google.maps.LatLngBounds();
  bounds.extend({ lat: fromPos.lat, lng: fromPos.lng });
  bounds.extend({ lat: toPos.lat, lng: toPos.lng });
  state.map.fitBounds(bounds, { top: 60, bottom: 60, left: 40, right: 40 });

  // Directions ile alternatif rotalar al
  const tid2 = addMsg(AI_PANEL, "system", "Alternatif rotalar hesaplanıyor…");

  const request = {
    origin: { lat: fromPos.lat, lng: fromPos.lng },
    destination: { lat: toPos.lat, lng: toPos.lng },
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: true,
    avoidFerries: true,
  };

  state.directionsService.route(request, (result, status) => {
    removeMsg(tid2);

    if (status !== "OK" || !result?.routes?.length) {
      const msg = status === "ZERO_RESULTS"
        ? "Bu iki nokta arasında karayolu rotası bulunamadı."
        : `Rota hatası: ${status}`;
      addMsg(AI_PANEL, "error", msg);
      if (note) { note.textContent = msg; note.style.display = ""; }
      return;
    }

    const routeCount = result.routes.length;
    const { index, safety } = pickSafestRoute(result);
    const chosen = result.routes[index];

    // Seçilen rotayı çiz
    clearCustomPolyline();
    try { state.directionsRenderer.setDirections({ routes: [] }); } catch { /* ignore */ }
    state.directionsRenderer.setDirections({
      geocoded_waypoints: result.geocoded_waypoints || [],
      request: result.request || {},
      routes: [chosen],
      status: "OK",
    });

    const legs = chosen.legs || [];
    const distM = legs.reduce((a, l) => a + (l.distance?.value || 0), 0);
    const timeS = legs.reduce((a, l) => a + (l.duration?.value || 0), 0);

    $("routeDist").textContent = `${(distM / 1000).toFixed(1)} km`;
    $("routeTime").textContent = `${Math.round(timeS / 60)} dk`;
    $("routeInfo").style.display = "block";
    applySafetyToUi(safety);

    const safeLabel = safety >= 70 ? "GÜVENLİ" : safety >= 45 ? "ORTA RİSK" : "RİSKLİ";
    addMsg(AI_PANEL, "system",
      `${routeCount} alternatif rota arasından en güvenli seçildi.<br>` +
      `Güvenlik: <strong>${Math.round(safety)}/100</strong> — ${safeLabel}<br>` +
      `Mesafe: ${(distM / 1000).toFixed(1)} km · Süre: ${Math.round(timeS / 60)} dk`
    );

    if (note) {
      note.textContent = `${routeCount} rota analiz edildi. Güvenlik skoru: ${Math.round(safety)}/100`;
      note.style.display = "";
    }

    // AI Analiz butonunu aktif et
    if (btnAi) btnAi.disabled = false;

    // Otomatik Gemini açıksa tetikle
    if (state.aiAvailable && shouldAutoGeminiAfterRoute()) {
      analyzeWithAI();
    }
  });
}

/** Şehir rotası için Gemini + uydu analizi */
async function analyzeCityRouteWithAI() {
  if (!state.aiAvailable) {
    addMsg(AI_PANEL, "error", "Gemini API anahtarı yok. .env dosyasını kontrol edin.");
    return;
  }
  if (!state.startPos || !state.endPos) {
    addMsg(AI_PANEL, "error", "Önce güvenli rota bulun.");
    return;
  }

  const fromVal = $("cityFrom")?.value?.trim() || "Başlangıç";
  const toVal = $("cityTo")?.value?.trim() || "Varış";

  const zonesDesc = state.disasterZones.length
    ? state.disasterZones.map(z =>
        `- ${z.name}: ${z.severity.toUpperCase()} (${z.lat.toFixed(4)},${z.lng.toFixed(4)})`
      ).join("\n")
    : "Aktif hasar bölgesi yok.";

  const routeDesc =
    `${fromVal} → ${toVal}\n` +
    `Mesafe: ${$("routeDist").textContent}, Süre: ${$("routeTime").textContent}, ` +
    `Güvenlik: ${$("safetyScore").textContent}`;

  const prompt =
    `Sen bir afet yönetimi ve kurtarma lojistiği uzmanısın.\n\n` +
    `GÜZERGAH: ${fromVal} → ${toVal}\n` +
    `ROTA BİLGİSİ: ${routeDesc}\n\n` +
    `HASAR BÖLGELERİ:\n${zonesDesc}\n\n` +
    `Görev (Türkçe, 5-8 madde):\n` +
    `1. Bu güzergahta olası moloz/yıkıntı/engel riski olan noktaları belirt\n` +
    `2. Fay hatlarına yakınlık değerlendirmesi yap\n` +
    `3. Alternatif güzergah önerileri sun\n` +
    `4. Kurtarma ekibi için öncelikli dikkat noktaları\n` +
    `Maksimum 250 kelime, kesin mühendislik iddiasından kaçın.`;

  const tid = addMsg(AI_PANEL, "system",
    `<div class="ai-label">Güzergah Analizi</div><div class="typing-dots"><span>▪</span><span>▪</span><span>▪</span></div>`,
    true
  );

  try {
    const text = await aiAnalyze(prompt);
    removeMsg(tid);
    const safe = escapeHtml(text).replace(/\n/g, "<br>");
    addMsg(AI_PANEL, "system",
      `<div class="ai-label">Gemini — ${fromVal} → ${toVal}</div><div class="ai-bubble">${safe}</div>`,
      true
    );
  } catch (e) {
    removeMsg(tid);
    addMsg(AI_PANEL, "error", e.message || "AI analizi başarısız");
  }
}

function handleMapClick(latLng) {
  const lat = latLng.lat();
  const lng = latLng.lng();
  if (state.cursorMode === "start") {
    setStartPoint(lat, lng);
    setCursorMode("end");
  } else if (state.cursorMode === "end") {
    setEndPoint(lat, lng);
    setCursorMode("observe");
  } else if (state.cursorMode === "disaster") {
    const sev =
      state.currentMode === "sim"
        ? $("simSeverity").value
        : $("realSeverity").value;
    addDisasterZone(
      lat,
      lng,
      `Hasar Bölgesi ${state.disasterZones.length + 1}`,
      sev
    );
    setCursorMode("observe");
  }
}

function setCursorMode(mode) {
  state.cursorMode = mode;
  const labels = {
    observe: "Gözlem",
    start: "Başlangıç seç",
    end: "Varış seç",
    disaster: "Hasar işaretle",
  };
  const hud = $("hudMode");
  if (hud) hud.textContent = labels[mode] || mode;
  if (state.map)
    state.map.setOptions({
      draggableCursor: mode !== "observe" ? "crosshair" : null,
    });
}

function setStartPoint(lat, lng) {
  state.startPos = { lat, lng };
  if (state.startMarker) state.startMarker.setMap(null);
  state.startMarker = new google.maps.Marker({
    position: { lat, lng },
    map: state.map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 9,
      fillColor: "#0ea5e9",
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 2,
    },
    title: "Başlangıç",
  });
  const box = $("startBox");
  box.className = "coord-box set start-set";
  $("startCoords").textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  checkReady();
}

function setEndPoint(lat, lng) {
  state.endPos = { lat, lng };
  if (state.endMarker) state.endMarker.setMap(null);
  state.endMarker = new google.maps.Marker({
    position: { lat, lng },
    map: state.map,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 9,
      fillColor: "#d97706",
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 2,
    },
    title: "Varış",
  });
  $("endBox").className = "coord-box set end-set";
  $("endCoords").textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  checkReady();
}

function checkReady() {
  const calc = $("calcBtn");
  if (calc) calc.disabled = !(state.startPos && state.endPos);
}

function clearCustomPolyline() {
  if (state.customPolyline) {
    state.customPolyline.setMap(null);
    state.customPolyline = null;
  }
}

function clearRoute() {
  if (state.startMarker) {
    state.startMarker.setMap(null);
    state.startMarker = null;
  }
  if (state.endMarker) {
    state.endMarker.setMap(null);
    state.endMarker = null;
  }
  clearCustomPolyline();
  if (state.directionsRenderer)
    try {
      state.directionsRenderer.setDirections({ routes: [] });
    } catch { /* ignore */ }
  state.startPos = null;
  state.endPos = null;
  $("startCoords").textContent = "Haritada seçin";
  $("endCoords").textContent = "Haritada seçin";
  $("startBox").className = "coord-box";
  $("endBox").className = "coord-box";
  $("routeInfo").style.display = "none";
  checkReady();
  setCursorMode("observe");
}

function refreshDisasterUi() {
  renderDisasterList("disasterList", "disasterCount", state.disasterZones, (id) =>
    removeDisasterZone(id)
  );
  setAlertHeader(state.disasterZones.length);
}

function newZoneId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `z-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function addDisasterZone(lat, lng, name, severity, radiusMOverride) {
  const radius =
    radiusMOverride != null && Number.isFinite(Number(radiusMOverride))
      ? Math.max(30, Math.min(Number(radiusMOverride), 2000))
      : ZONE_RADII[severity] || 400;
  const color = ZONE_COLORS[severity] || "#64748b";
  const zone = { lat, lng, name, severity, id: newZoneId() };
  state.disasterZones.push(zone);
  const circle = new google.maps.Circle({
    map: state.map,
    center: { lat, lng },
    radius,
    clickable: false,
    strokeColor: color,
    strokeOpacity: 0.75,
    strokeWeight: 1.5,
    fillColor: color,
    fillOpacity: 0.11,
  });
  const marker = new google.maps.Marker({
    position: { lat, lng },
    map: state.map,
    clickable: false,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 6,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 1.5,
    },
    title: name,
  });
  state.disasterCircles.push({ circle, marker, id: zone.id });
  refreshDisasterUi();
}

function removeDisasterZone(id) {
  state.yoloZoneIds = (state.yoloZoneIds || []).filter((x) => String(x) !== String(id));
  state.yoloRects = (state.yoloRects || []).filter((x) => {
    if (String(x.id) === String(id)) {
      try {
        x.rect?.setMap(null);
      } catch {
        /* ignore */
      }
      return false;
    }
    return true;
  });
  state.disasterZones = state.disasterZones.filter(
    (z) => String(z.id) !== String(id)
  );
  const i = state.disasterCircles.findIndex((c) => String(c.id) === String(id));
  if (i !== -1) {
    state.disasterCircles[i].circle.setMap(null);
    state.disasterCircles[i].marker.setMap(null);
    state.disasterCircles.splice(i, 1);
  }
  refreshDisasterUi();
}

function clearDisasterZones() {
  state.disasterCircles.forEach((c) => {
    c.circle.setMap(null);
    c.marker.setMap(null);
  });
  state.disasterCircles = [];
  state.disasterZones = [];
  refreshDisasterUi();
}

function loadScenario() {
  if (!state.map) return;
  clearDisasterZones();
  const key = $("simScenario").value;
  const s = SCENARIOS[key];
  if (!s || !s.zones.length) {
    state.map.setCenter(s.center);
    state.map.setZoom(s.zoom);
    addMsg(
      AI_PANEL,
      "system",
      "Özel mod: hasarı haritadan veya koordinatla ekleyin."
    );
    return;
  }
  state.map.setCenter(s.center);
  state.map.setZoom(s.zoom);
  s.zones.forEach((z) =>
    addDisasterZone(z.lat, z.lng, z.name, z.sev)
  );
  const sel = $("simScenario");
  addMsg(
    AI_PANEL,
    "system",
    `"${sel.options[sel.selectedIndex].text}" yüklendi — ${s.zones.length} bölge.`
  );
}

function addRealPoint() {
  const raw = $("realCoordInput").value.trim();
  const name =
    $("realNameInput").value.trim() ||
    `Veri ${state.disasterZones.length + 1}`;
  const sev = $("realSeverity").value;
  const parts = raw.split(",").map((x) => parseFloat(x.trim()));
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) {
    addMsg(AI_PANEL, "error", "Geçersiz koordinat. Örnek: 37.57, 36.92");
    return;
  }
  const [lat, lng] = parts;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    addMsg(AI_PANEL, "error", "Koordinat aralığı dışında.");
    return;
  }
  addDisasterZone(lat, lng, name, sev);
  if (state.map) state.map.setCenter({ lat, lng });
  $("realCoordInput").value = "";
  $("realNameInput").value = "";
  addMsg(
    AI_PANEL,
    "system",
    `Eklendi: ${escapeHtml(name)} (${lat.toFixed(4)}, ${lng.toFixed(4)})`
  );
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function magToSeverity(m) {
  const x = Number(m);
  if (x >= 5) return "high";
  if (x >= 3.5) return "medium";
  return "low";
}


function updateEqRangeLabel() {
  const lbl = $("eqRangeLabel");
  const src = $("eqSource")?.value || "usgs";
  if (lbl)
    lbl.textContent =
      src === "afad"
        ? "Son gün (AFAD, en fazla 60)"
        : "Son gün (USGS zaman filtresi)";
}

async function loadLiveEarthquakes() {
  const source = $("eqSource").value;
  const days = Number($("eqDays").value) || 7;
  const minMag = Number($("eqMinMag").value) || 2.5;
  if (!state.map) {
    addMsg(AI_PANEL, "error", "Önce haritayı başlatın.");
    return;
  }
  const tid = addMsg(AI_PANEL, "system", "Deprem listesi yükleniyor…");
  try {
    const data = await fetchEarthquakes({
      source,
      days,
      minMagnitude: minMag,
      limit: 50,
    });
    removeMsg(tid);
    const features = data.features || [];
    if (!features.length) {
      addMsg(AI_PANEL, "system", "Filtreye uyan deprem bulunamadı.");
      return;
    }
    let n = 0;
    for (const f of features) {
      const mag = Number(f.mag);
      const name = `${f.place} M${Number.isFinite(mag) ? mag.toFixed(1) : "?"}`;
      addDisasterZone(f.lat, f.lng, name, magToSeverity(mag));
      n++;
    }
    addMsg(
      AI_PANEL,
      "system",
      `${String(data.source || "").toUpperCase()}: ${n} deprem alanı eklendi.`
    );
    state.map.setCenter({ lat: features[0].lat, lng: features[0].lng });
    state.map.setZoom(7);
  } catch (e) {
    removeMsg(tid);
    addMsg(AI_PANEL, "error", e.message || "Deprem verisi alınamadı");
  }
}

function pickSafestRoute(result) {
  const routes = result.routes || [];
  if (!routes.length) return { index: 0, safety: 0, exposure: 0 };
  let bestIdx = 0;
  let bestComposite = -1e9;
  let bestSafety = 0;
  let bestExposure = 0;
  routes.forEach((route, idx) => {
    const path = route.overview_path || [];
    const samples = samplePolyline(path, 96);
    const exp = computeExposure(samples, state.disasterZones);
    const safety = exposureToSafety01(exp);
    const distM =
      route.legs?.reduce((a, l) => a + (l.distance?.value || 0), 0) || 0;
    const composite = safety - (distM / 250000) * 0.02;
    if (composite > bestComposite) {
      bestComposite = composite;
      bestIdx = idx;
      bestSafety = safety;
      bestExposure = exp;
    }
  });
  return { index: bestIdx, safety: bestSafety, exposure: bestExposure };
}

function shouldAutoGeminiAfterRoute() {
  return Boolean($("chkAutoGemini")?.checked);
}

function calculateRoute() {
  if (!state.startPos || !state.endPos || !state.map) return;
  const vehicle = $("vehicleMode")?.value || "car";
  addMsg(
    AI_PANEL,
    "user",
    `Rota [${vehicle}]: (${state.startPos.lat.toFixed(4)},${state.startPos.lng.toFixed(
      4
    )}) → (${state.endPos.lat.toFixed(4)},${state.endPos.lng.toFixed(4)})`
  );

  clearCustomPolyline();
  if (state.directionsRenderer)
    try {
      state.directionsRenderer.setDirections({ routes: [] });
    } catch { /* ignore */ }

  if (vehicle === "helicopter") {
    if (!google.maps.geometry?.spherical) {
      addMsg(
        AI_PANEL,
        "error",
        "geometry kütüphanesi yüklenemedi. Sayfayı yenileyin."
      );
      return;
    }
    const p0 = new google.maps.LatLng(state.startPos.lat, state.startPos.lng);
    const p1 = new google.maps.LatLng(state.endPos.lat, state.endPos.lng);
    const path = [];
    const steps = 56;
    for (let i = 0; i <= steps; i++) {
      path.push(google.maps.geometry.spherical.interpolate(p0, p1, i / steps));
    }
    state.customPolyline = new google.maps.Polyline({
      path,
      geodesic: true,
      map: state.map,
      strokeColor: "#c084fc",
      strokeOpacity: 0.95,
      strokeWeight: 5,
    });
    const distM = google.maps.geometry.spherical.computeDistanceBetween(p0, p1);
    const kmh = 195;
    const timeS = (distM / 1000 / kmh) * 3600;
    $("routeDist").textContent = `${(distM / 1000).toFixed(1)} km (hava)`;
    $("routeTime").textContent = `${Math.max(1, Math.round(timeS / 60))} dk (~${kmh} km/sa)`;
    $("routeInfo").style.display = "block";
    const flat = path.map((ll) => ({ lat: ll.lat(), lng: ll.lng() }));
    const exp = computeExposure(flat, state.disasterZones);
    applySafetyToUi(exposureToSafety01(exp));
    if (state.aiAvailable && shouldAutoGeminiAfterRoute()) analyzeWithAI();
    return;
  }

  if (vehicle === "boat") {
    fetchWaterRoute(state.startPos, state.endPos)
      .then((out) => {
        if (!out.path || out.path.length < 2 || out.approximate) {
          addMsg(
            AI_PANEL,
            "error",
            out.reason || "Bu bölgeye su yolu ile ulaşmak imkânsız."
          );
          return;
        }
        const path = out.path.map(
          (p) => new google.maps.LatLng(p.lat, p.lng)
        );
        state.customPolyline = new google.maps.Polyline({
          path,
          geodesic: false,
          map: state.map,
          strokeColor: "#38bdf8",
          strokeOpacity: 0.92,
          strokeWeight: 5,
        });
        let distM = out.distanceM || 0;
        if (!distM) {
          for (let i = 0; i < out.path.length - 1; i++) {
            const a = out.path[i];
            const b = out.path[i + 1];
            distM += haversineKm(a.lat, a.lng, b.lat, b.lng) * 1000;
          }
        }
        const kmh = 20;
        const timeS = (distM / 1000 / kmh) * 3600;
        $("routeDist").textContent = `${(distM / 1000).toFixed(1)} km (su)`;
        $("routeTime").textContent = `${Math.max(1, Math.round(timeS / 60))} dk (~${kmh} km/sa)`;
        $("routeInfo").style.display = "block";
        const flat = path.map((ll) => ({ lat: ll.lat(), lng: ll.lng() }));
        const exp = computeExposure(flat, state.disasterZones);
        applySafetyToUi(exposureToSafety01(exp));
        if (state.aiAvailable && shouldAutoGeminiAfterRoute()) analyzeWithAI();
      })
      .catch((e) => addMsg(AI_PANEL, "error", e.message || "Tekne rotası hatası"));
    return;
  }

  const request = {
    origin: state.startPos,
    destination: state.endPos,
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: true,
    avoidFerries: true,
    avoidHighways: false,
  };
  state.directionsService.route(request, (result, status) => {
    if (status !== "OK" || !result?.routes?.length) {
      const human =
        status === "ZERO_RESULTS"
          ? "Karayolu rotası yok — noktaları yol kenarına yaklaştırın veya helikopter/tekne modunu deneyin."
          : status === "OVER_QUERY_LIMIT"
            ? "Kota sınırı — daha sonra deneyin."
            : `Rota hatası: ${status}`;
      addMsg(AI_PANEL, "error", human);
      return;
    }
    const { index, safety } = pickSafestRoute(result);
    const chosen = result.routes[index];
    state.directionsRenderer.setDirections({
      geocoded_waypoints: result.geocoded_waypoints || [],
      request: result.request || {},
      routes: [chosen],
      status: "OK",
    });

    const legs = chosen.legs || [];
    const distM = legs.reduce((a, l) => a + (l.distance?.value || 0), 0);
    const timeS = legs.reduce((a, l) => a + (l.duration?.value || 0), 0);
    $("routeDist").textContent = `${(distM / 1000).toFixed(1)} km`;
    $("routeTime").textContent = `${Math.round(timeS / 60)} dk`;
    $("routeInfo").style.display = "block";

    applySafetyToUi(safety);

    if (state.aiAvailable && shouldAutoGeminiAfterRoute()) analyzeWithAI();
    else if (!state.aiAvailable)
      addMsg(
        AI_PANEL,
        "system",
        "Gemini yok. «Rota AI analizi» veya kota uyarısı için .env anahtarını kontrol edin."
      );
  });
}

function applySafetyToUi(safety) {
  const el = $("safetyScore");
  el.textContent = `${Math.round(safety)}/100`;
  el.style.color =
    safety >= 70 ? "var(--green)" : safety >= 45 ? "var(--amber)" : "var(--red)";
  $("safetyDesc").textContent = safetyLabelTr(safety);
}

async function analyzeWithAI() {
  if (!state.aiAvailable) {
    addMsg(
      AI_PANEL,
      "error",
      "Sunucuda GEMINI_API_KEY yok. .env dosyasını kontrol edin."
    );
    return;
  }
  
  if (!state.startPos || !state.endPos) {
    addMsg(AI_PANEL, "error", "Önce başlangıç ve varış noktaları belirleyin.");
    return;
  }

  const tid = addMsg(
    AI_PANEL,
    "system",
    '<div class="ai-label">AI Rota Analizi</div><div class="typing-dots"><span>▪</span><span>▪</span><span>▪</span></div>',
    true
  );

  try {
    // Gemini 2.5 Flash ile sadece metin tabanlı rota analizi
    const result = await analyzeRouteWithAI(
      state.startPos.lat,
      state.startPos.lng,
      state.endPos.lat,
      state.endPos.lng,
      null // Harita görüntüsü gönderilmiyor
    );

    removeMsg(tid);
    
    const safe = escapeHtml(result.analysis).replace(/\n/g, "<br>");
    addMsg(
      AI_PANEL,
      "system",
      `<div class="ai-label">Gemini 2.5 Flash — ${new Date().toLocaleTimeString(
        "tr-TR"
      )} (${result.provider})</div>${safe}`,
      true
    );

    // Ek güvenlik bilgisi varsa UI'a yansıt
    if (result.coordinates) {
      console.log("AI rota analizi tamamlandı:", result.provider);
    }

  } catch (e) {
    removeMsg(tid);
    addMsg(AI_PANEL, "error", e.message || "AI rota analizi başarısız");
  }
}

async function askAI(question) {
  if (!state.aiAvailable) {
    addMsg(AI_PANEL, "error", "AI servisi kapalı.");
    return;
  }
  addMsg(AI_PANEL, "user", escapeHtml(question));
  const zonesSummary =
    state.disasterZones.map((z) => `${z.name}(${z.severity})`).join(", ") ||
    "bölge yok";
  const prompt = quickQuestionPrompt(zonesSummary, question);
  const tid = addMsg(
    AI_PANEL,
    "system",
    '<div class="typing-dots"><span>▪</span><span>▪</span><span>▪</span></div>',
    true
  );
  try {
    const text = await aiChat(prompt);
    removeMsg(tid);
    const safe = escapeHtml(text).replace(/\n/g, "<br>");
    addMsg(
      AI_PANEL,
      "system",
      `<div class="ai-label">Gemini</div>${safe}`,
      true
    );
  } catch (e) {
    removeMsg(tid);
    addMsg(AI_PANEL, "error", e.message || "Hata");
  }
}

function switchMode(mode) {
  state.currentMode = mode;
  $("tabSim").classList.toggle("active", mode === "sim");
  $("tabReal").classList.toggle("active", mode === "real");
  $("simControls").style.display = mode === "sim" ? "" : "none";
  $("realControls").style.display = mode === "real" ? "" : "none";
  clearDisasterZones();
  if (mode === "sim") loadScenario();
  else {
    addMsg(
      AI_PANEL,
      "system",
      "Gerçek veri modu: canlı depremleri yükleyin, koordinat girin veya haritadan işaretleyin."
    );
    updateEqRangeLabel();
  }
  updateKahramanSatBlock();
}

async function startSystem() {
  const manual = $("gmKeyInput")?.value?.trim() || "";
  const manualGemini = $("geminiKeyInput")?.value?.trim() || "";
  const key = state.gmKey || manual;
  if (!key) {
    addMsg(
      AI_PANEL,
      "error",
      "Google Maps anahtarı yok. .env içinde GOOGLE_MAPS_API_KEY ayarlayın veya buraya girin."
    );
    return;
  }

  // Runtime key'leri sunucuya gönder
  if (manual || manualGemini) {
    try {
      const r = await fetch("/api/set-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapsKey: manual || undefined, geminiKey: manualGemini || undefined }),
      });
      const data = await r.json().catch(() => ({}));
      if (data.aiAvailable) {
        state.aiAvailable = true;
        setAiChip(true);
        $("analyzeBtn").disabled = false;
      }
    } catch { /* sunucu hatası — devam et */ }
  }

  state.gmKey = key;
  $("setupOverlay").style.display = "none";
  loadGoogleMapsScript(key);
}

async function bootstrap() {
  initClock("clock");
  let configMaps = "";
  try {
    const cfg = await fetchConfig();
    configMaps = cfg.mapsApiKey || "";
    state.aiAvailable = cfg.aiAvailable;
    state.copernicusConfigured = Boolean(cfg.copernicusConfigured);
    state.yoloScript = Boolean(cfg.yoloScript);
    state.autoGeminiAfterRoute = Boolean(cfg.autoGeminiAfterRoute);
    const chkAg = $("chkAutoGemini");
    if (chkAg) chkAg.checked = state.autoGeminiAfterRoute;
    if (cfg.geminiModelsHint)
      console.info("Gemini model sırası:", cfg.geminiModelsHint);
    setAiChip(state.aiAvailable);
    $("analyzeBtn").disabled = !state.aiAvailable;
  } catch (e) {
    addMsg(AI_PANEL, "error", e.message);
  }

  const health = await fetchHealth();
  if (health.aiConfigured === false) setAiChip(false);

  if (configMaps) {
    state.gmKey = configMaps;
    $("setupOverlay").style.display = "none";
    loadGoogleMapsScript(configMaps);
  } else {
    $("setupOverlay").style.display = "flex";
    $("gmKeyInput").value = "";
    if ($("geminiKeyInput")) $("geminiKeyInput").value = "";
    $("gmKeyHint").textContent =
      "Sunucu anahtar göndermedi. .env içine GOOGLE_MAPS_API_KEY ve GEMINI_API_KEY ekleyin veya buraya girin.";
  }

  $("btnStart").addEventListener("click", startSystem);
  $("tabSim").addEventListener("click", () => switchMode("sim"));
  $("tabReal").addEventListener("click", () => switchMode("real"));
  $("simScenario").addEventListener("change", () => {
    if (state.currentMode === "sim") loadScenario();
  });
  $("btnLoadScenario").addEventListener("click", () => loadScenario());
  $("btnCursorStart").addEventListener("click", () =>
    setCursorMode("start")
  );
  $("btnCursorEnd").addEventListener("click", () => setCursorMode("end"));
  $("btnClearRoute").addEventListener("click", () => clearRoute());
  $("calcBtn").addEventListener("click", () => calculateRoute());
  $("btnDisasterSim").addEventListener("click", () =>
    setCursorMode("disaster")
  );
  $("btnAddReal").addEventListener("click", () => addRealPoint());
  $("btnDisasterReal").addEventListener("click", () =>
    setCursorMode("disaster")
  );
  $("analyzeBtn").addEventListener("click", () => analyzeWithAI());
  $("btnAskDanger").addEventListener("click", () =>
    askAI("Bu bölgedeki başlıca tehlikeleri listele.")
  );
  $("btnAskPriority").addEventListener("click", () =>
    askAI("Kurtarma ekibi için önceliklendirme öner.")
  );
  $("btnAskWeather").addEventListener("click", () =>
    askAI("Acil durumda hava ve görüş koşullarına dikkat edilecek hususlar.")
  );

  $("eqSource")?.addEventListener("change", () => updateEqRangeLabel());
  $("btnLoadEarthquakes")?.addEventListener("click", () => loadLiveEarthquakes());
  // Şehir / İlçe güvenli rota
  $("btnCityRoute")?.addEventListener("click", () => findCityRoute());
  $("btnCityRouteAi")?.addEventListener("click", () => analyzeCityRouteWithAI());
  // Enter tuşuyla da tetikle
  [$("cityFrom"), $("cityTo")].forEach((inp) => {
    inp?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") findCityRoute();
    });
  });

  // Sağ panel sekme geçişleri
  const rightPanes = { tabAnaliz: "paneAnaliz", tabToplanma: "paneToplanma" };
  Object.keys(rightPanes).forEach((tabId) => {
    $(tabId)?.addEventListener("click", () => {
      Object.keys(rightPanes).forEach((t) => {
        const active = t === tabId;
        $(t)?.classList.toggle("active", active);
        const pane = $(rightPanes[t]);
        if (pane) pane.style.display = active ? "flex" : "none";
      });
    });
  });

  // Toplanma alanları event listener'ları
  $("assemblySearch")?.addEventListener("input", (e) => {
    filterAssembly(e.target.value);
  });

  $("assemblyTipFilter")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tip]");
    if (!btn) return;
    $("assemblyTipFilter").querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    filterAssembly($("assemblySearch")?.value || "", btn.dataset.tip);
  });

  $("chkAssemblyVisible")?.addEventListener("change", (e) => {
    if (!state.toplanmaKatmani) return;
    if (e.target.checked) {
      filterAssembly($("assemblySearch")?.value || "");
    } else {
      state.toplanmaKatmani.hideAll();
    }
  });

  updateEqRangeLabel();
  updateKahramanSatBlock();
  refreshDisasterUi();
  if (!configMaps) setMapStatus(false, "Anahtar bekleniyor");
}

document.addEventListener("DOMContentLoaded", bootstrap);
