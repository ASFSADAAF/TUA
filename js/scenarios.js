/** Hazır afet senaryoları — koordinatlar yaklaşık eğitim amaçlıdır. */

export const SCENARIOS = {
  kahraman: {
    center: { lat: 37.5765, lng: 36.9228 },
    zoom: 8,
    zones: [
      { lat: 37.5765, lng: 36.9228, name: "Kahramanmaraş Merkez", sev: "high" },
      { lat: 37.0681, lng: 37.3781, name: "Gaziantep Nurdağı", sev: "high" },
      { lat: 37.7571, lng: 38.2754, name: "Adıyaman Çevre", sev: "high" },
      { lat: 36.9913, lng: 35.3308, name: "Adana Ceyhan", sev: "medium" },
      { lat: 37.9248, lng: 40.2207, name: "Diyarbakır Yol", sev: "medium" },
      { lat: 38.3552, lng: 38.3095, name: "Malatya İlçe", sev: "medium" },
    ],
  },
  istanbul: {
    center: { lat: 41.0082, lng: 28.9784 },
    zoom: 9,
    zones: [
      { lat: 40.9833, lng: 28.817, name: "Avcılar Fay Hattı", sev: "high" },
      { lat: 41.0192, lng: 29.112, name: "Kadıköy Kıyı", sev: "high" },
      { lat: 41.0544, lng: 28.8907, name: "Bağcılar Yol", sev: "medium" },
      { lat: 40.9776, lng: 29.032, name: "Pendik Sahil", sev: "medium" },
      { lat: 41.0822, lng: 29.0136, name: "Üsküdar Merkez", sev: "low" },
    ],
  },
  izmir: {
    center: { lat: 38.4192, lng: 27.1287 },
    zoom: 9,
    zones: [
      { lat: 38.4192, lng: 27.1287, name: "İzmir Merkez", sev: "high" },
      { lat: 38.0696, lng: 26.5477, name: "Seferihisar Sahil", sev: "high" },
      { lat: 38.2716, lng: 26.9793, name: "Bayraklı Körfez", sev: "medium" },
      { lat: 38.4892, lng: 27.2183, name: "Karşıyaka Kuzey", sev: "low" },
    ],
  },
  ankara: {
    center: { lat: 39.9334, lng: 32.8597 },
    zoom: 9,
    zones: [
      { lat: 39.9334, lng: 32.8597, name: "Ankara Çayyolu", sev: "medium" },
      { lat: 39.8753, lng: 32.7625, name: "Etimesgut Dere", sev: "high" },
      { lat: 40.0267, lng: 32.8943, name: "Keçiören Kuzey", sev: "low" },
      { lat: 39.7945, lng: 32.7169, name: "Gölbaşı Yol", sev: "medium" },
    ],
  },
  custom: { center: { lat: 39.0, lng: 35.0 }, zoom: 6, zones: [] },
};

export const ZONE_RADII = { high: 800, medium: 400, low: 150 };
export const ZONE_COLORS = { high: "#dc2626", medium: "#d97706", low: "#16a34a" };
