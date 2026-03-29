# BKZS — Afet Yönetim Sistemi

## Proje Özeti

BKZS (Bölgesel Konumlama ve Zamanlama Sistemi), deprem, sel ve benzeri afet senaryolarında kurtarma ekiplerine **güvenli rota planlaması** yapan yapay zeka destekli bir web uygulamasıdır.

Kullanıcı harita üzerinde hasar bölgelerini işaretler ya da canlı deprem verisi yükler; sistem bu bölgelere olan mesafeyi ve risk düzeyini hesaplayarak alternatif rotalar arasından en güvenliyi seçer. Tüm AI çağrıları (Gemini) sunucu tarafında yapılır, API anahtarları tarayıcıya gönderilmez.

### Temel Özellikler

- Google Maps üzerinde interaktif hasar bölgesi yönetimi
- Otomobil, motosiklet, tekne (OSM akarsu ağı) ve helikopter rota modları
- Alternatif rotalar arasından risk skoruna göre en güvenli güzergah seçimi (0–100 güvenlik skoru)
- Şehir / ilçe adı yazarak güvenli rota bulma ve Gemini ile güzergah analizi
- USGS ve AFAD'dan canlı deprem verisi çekme
- Copernicus Sentinel-2 uydu görüntüsü çifti (Kahramanmaraş 2023 öncesi/sonrası)
- YOLOv8 + OpenCV ile uydu görüntüsü üzerinde bina hasar tespiti
- Gemini ile taktik durum raporu, tehlike analizi ve önceliklendirme

### Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Harita | Google Maps JavaScript API (AdvancedMarkerElement, Directions, Geometry) |
| Rota | Google Directions API + OSM Overpass (tekne) |
| Yapay Zeka | Google Gemini (sunucu tarafı proxy) |
| Uydu | Copernicus Sentinel-2 / Sentinel Hub Process API |
| Hasar Tespiti | YOLOv8 + OpenCV (Python, isteğe bağlı) |
| Sunucu | Node.js + Express |
| Arayüz | Vanilla JS (ES Modülleri), HTML, CSS |

---

## Kurulum

### Gereksinimler

- Node.js 18+
- npm 9+
- Google Cloud hesabı — Maps JavaScript API ve Directions API etkin olmalı

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. `.env` dosyasını oluştur

```env
# Zorunlu
GOOGLE_MAPS_API_KEY=AIza...

# İsteğe bağlı — Gemini AI
GEMINI_API_KEY=AIza...
GEMINI_MODELS=gemini-1.5-flash-8b,gemini-1.5-flash,gemini-2.0-flash

# İsteğe bağlı — Copernicus uydu görüntüsü
COPERNICUS_CLIENT_ID=...
COPERNICUS_CLIENT_SECRET=...

# İsteğe bağlı — YOLOv8 hasar tespiti
YOLO_PYTHON=python
YOLO_MODEL_PATH=yolov8n.pt

# Sunucu portu (varsayılan: 3000)
PORT=3000
```

### 3. Başlat

```bash
npm start
```

Tarayıcıda aç: `http://localhost:3000`

> `index.html`'i `file://` ile doğrudan açma — `/api/*` uçları çalışmaz.

---

## Arayüz Rehberi

### Sol Panel — Rota Planlama

| Kontrol | İşlev |
|---|---|
| Simülasyon sekmesi | Hazır afet senaryolarını yükler (Kahramanmaraş, İstanbul, İzmir, Ankara) |
| Gerçek veri sekmesi | Canlı deprem verisi veya manuel koordinat girişi modu |
| Başlangıç butonu | Haritada tıklayarak başlangıç noktası seçer (mavi pin) |
| Varış butonu | Haritada tıklayarak varış noktası seçer (turuncu pin) |
| Temizle | Rota ve noktaları sıfırlar |
| Taşıt seçimi | Otomobil / Motosiklet / Tekne / Helikopter |
| Senaryo yükle | Seçili senaryonun hasar bölgelerini haritaya ekler |
| + Hasar | Haritada tıklayarak manuel hasar bölgesi ekler |
| Rota hesapla | Başlangıç + varış seçilince aktif olur; en güvenli rotayı çizer |

#### Şehir / İlçe Güvenli Rota

İki metin kutusuna şehir veya ilçe adı yaz, "Güvenli Rota Bul"a bas. Sistem geocoder ile koordinata çevirir, alternatif rotaları risk skorlar ve en güvenliyi seçer. "AI Analiz" butonu Gemini'ye moloz/engel riski ve alternatif güzergah analizi yaptırır.

#### Simülasyon Modu Ek Kontroller

| Kontrol | İşlev |
|---|---|
| Hasar seviyesi | Yüksek / Orta / Düşük |
| Uydu çiftini yükle | Copernicus Sentinel-2 görüntülerini indirir (Copernicus kimliği gerekir) |
| Uydu + AI hasar | YOLOv8 + Gemini ile hasar analizi yapar, bölgeleri haritaya işler |

#### Gerçek Veri Modu Ek Kontroller

| Kontrol | İşlev |
|---|---|
| Kaynak (USGS / AFAD) | Canlı deprem verisi kaynağı |
| Gün sayısı | Kaç günlük veri çekileceği |
| Min. büyüklük | Filtre eşiği |
| Canlı yükle | Depremleri çekip haritaya ekler |
| Koordinat + Ekle | Manuel `enlem,boylam` girişiyle bölge ekler |
| Haritadan | Haritada tıklayarak bölge ekler |

---

### Harita Alanı

| Kontrol | İşlev |
|---|---|
| Konum ara | Adres/yer adı arar, haritayı oraya odaklar |
| Mod göstergesi (HUD) | Gözlem / Başlangıç seç / Varış seç / Hasar işaretle |

---

### Sağ Panel — Analiz & AI

| Kontrol | İşlev |
|---|---|
| Rota AI analizi (Gemini) | Rota + hasar bölgelerini Gemini'ye göndererek taktik özet üretir |
| Otomatik Gemini (checkbox) | Her rota hesabından sonra otomatik analiz yapar (kota tüketir) |
| Tehlike | Bölgedeki başlıca tehlikeleri listeler |
| Öncelik | Kurtarma ekibi için önceliklendirme önerir |
| Hava | Hava ve görüş koşulları hakkında analiz yapar |
| Mesafe / Süre / Güvenlik skoru | Rota hesaplandıktan sonra görünür; skor ≥70 yeşil, ≥45 sarı, <45 kırmızı |

---

## Taşıt Modları

| Mod | Açıklama |
|---|---|
| Otomobil | Google Directions — karayolu, alternatif rotalar |
| Motosiklet | Google Directions — karayolu |
| Tekne | OSM Overpass akarsu/kanal ağı üzerinde Dijkstra |
| Helikopter | Geodezik düz hat, ~195 km/sa tahmini |

---

## Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|---|---|
| Harita açılmıyor | `.env` içinde `GOOGLE_MAPS_API_KEY` tanımlı mı? |
| Gemini yanıt vermiyor | `GEMINI_API_KEY` doğru mu? Google AI Studio'da kota kontrolü yap |
| Uydu çifti yüklenmiyor | `COPERNICUS_CLIENT_ID` ve `COPERNICUS_CLIENT_SECRET` gerekli |
| Tekne rotası bulunamadı | Başlangıç/varışı nehir/kanal kenarına yaklaştır |
| `file://` ile çalışmıyor | `npm start` ile aç: `http://localhost:3000` |
