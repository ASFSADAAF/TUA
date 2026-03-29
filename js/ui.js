/** Arayüz parçaları: mesaj akışı, liste, saat. */

let msgId = 0;

export function initClock(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  const tick = () => {
    const now = new Date();
    el.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");
  };
  tick();
  setInterval(tick, 1000);
}

export function addMsg(panelId, type, html, rawHtmlBubble = false) {
  const id = `msg-${++msgId}`;
  const panel = document.getElementById(panelId);
  if (!panel) return id;
  const div = document.createElement("div");
  div.className = `ai-msg ${type}`;
  div.id = id;
  const label =
    type === "user" ? "Operatör" : type === "error" ? "Hata" : "Sistem";
  div.innerHTML = rawHtmlBubble
    ? `<div class="ai-bubble">${html}</div>`
    : `<div class="ai-label">${label}</div><div class="ai-bubble">${html}</div>`;
  panel.appendChild(div);
  panel.scrollTop = panel.scrollHeight;
  return id;
}

export function removeMsg(id) {
  document.getElementById(id)?.remove();
}

export function renderDisasterList(listElId, countElId, zones, onRemoveId) {
  const el = document.getElementById(listElId);
  const count = document.getElementById(countElId);
  if (count) count.textContent = String(zones.length);
  if (!el) return;
  if (!zones.length) {
    el.innerHTML =
      '<div class="d-empty">Henüz bölge yok</div>';
    return;
  }
  el.innerHTML = zones
    .map(
      (z) => `
    <div class="d-item">
      <div class="d-sev ${z.severity}"></div>
      <div class="d-name">${escapeHtml(z.name)}</div>
      <span class="d-badge ${z.severity}">${severityLabel(z.severity)}</span>
      <button type="button" class="d-remove" data-id="${z.id}" aria-label="Kaldır">×</button>
    </div>`
    )
    .join("");
  el.querySelectorAll(".d-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      if (id != null) onRemoveId(id);
    });
  });
}

function severityLabel(s) {
  if (s === "high") return "Yüksek";
  if (s === "medium") return "Orta";
  return "Düşük";
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function setAlertHeader(count) {
  const text = document.getElementById("alertText");
  const dot = document.getElementById("alertDot");
  if (text) text.textContent = `${count} Alarm`;
  if (dot) dot.className = "dot" + (count > 0 ? " err" : "");
}

export function setMapStatus(ok, message) {
  const dot = document.getElementById("mapDot");
  const status = document.getElementById("mapStatus");
  if (dot) dot.className = "dot" + (ok ? " on" : "");
  if (status) status.textContent = message;
}

export function setAiChip(active) {
  const el = document.querySelector('[data-chip="ai"]');
  const dot = el?.querySelector(".dot");
  if (dot) dot.className = "dot" + (active ? " on" : "");
}
