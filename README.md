# BKZS Afet Yönetim Sistemi

## Kurulum

```bash
npm install
npm start
```

## Environment Değişkenleri

```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
COPERNICUS_CLIENT_ID=your_copernicus_id
COPERNICUS_CLIENT_SECRET=your_copernicus_secret
GEMINI_MODEL=gemini-2.5-flash
GEMINI_AUTO_AFTER_ROUTE=false
```

## Port

Sunucu `process.env.PORT` değişkenini kullanır. Eğer tanımlı değilse 3000 portunu kullanır.

## Özellikler

- Gemini 2.5 Flash ile AI destekli rota analizi
- Afet senaryoları ve risk değerlendirmesi
- Toplanma alanları harita üzerinde gösterimi
- Çoklu taşıt modu (araç, helikopter, tekne)
- Canlı deprem verileri (USGS/AFAD)

## Production

Production ortamında PORT environment değişkenini ayarlayın:

```bash
PORT=8080 npm start
```
