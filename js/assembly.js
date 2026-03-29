/**
 * Türkiye Afet Toplanma Alanları — Offline Gömülü Veri
 * google.maps.Marker kullanır (mapId gerekmez)
 */
export const TOPLANMA_ALANLARI = [
  // ── İSTANBUL ──────────────────────────────────────────────────────────────
  { id:"ist01", il:"İstanbul",  ilce:"Kadıköy",       ad:"Fenerbahçe Parkı",              lat:40.9697, lng:29.0337, kapasite:15000, tip:"park"    },
  { id:"ist02", il:"İstanbul",  ilce:"Beşiktaş",      ad:"Maçka Parkı",                   lat:41.0432, lng:29.0012, kapasite:8000,  tip:"park"    },
  { id:"ist03", il:"İstanbul",  ilce:"Fatih",          ad:"Yenikapı Miting Alanı",         lat:40.9985, lng:28.9497, kapasite:50000, tip:"meydan"  },
  { id:"ist04", il:"İstanbul",  ilce:"Ataşehir",       ad:"Ataşehir Meydan Parkı",         lat:40.9923, lng:29.1244, kapasite:10000, tip:"park"    },
  { id:"ist05", il:"İstanbul",  ilce:"Pendik",         ad:"Pendik Sahil Parkı",            lat:40.8762, lng:29.2341, kapasite:12000, tip:"park"    },
  { id:"ist06", il:"İstanbul",  ilce:"Avcılar",        ad:"Avcılar Merkez Parkı",          lat:40.9793, lng:28.7219, kapasite:9000,  tip:"park"    },
  { id:"ist07", il:"İstanbul",  ilce:"Maltepe",        ad:"Maltepe Sahil Parkı",           lat:40.9341, lng:29.1312, kapasite:20000, tip:"park"    },
  { id:"ist08", il:"İstanbul",  ilce:"Bağcılar",       ad:"Bağcılar Meydan Parkı",         lat:41.0367, lng:28.8561, kapasite:8000,  tip:"meydan"  },
  { id:"ist09", il:"İstanbul",  ilce:"Üsküdar",        ad:"Üsküdar Meydanı",               lat:41.0231, lng:29.0151, kapasite:7000,  tip:"meydan"  },
  // ── ANKARA ────────────────────────────────────────────────────────────────
  { id:"ank01", il:"Ankara",    ilce:"Çankaya",        ad:"Kuğulu Park",                   lat:39.9032, lng:32.8597, kapasite:5000,  tip:"park"    },
  { id:"ank02", il:"Ankara",    ilce:"Keçiören",       ad:"Keçiören Millet Bahçesi",       lat:39.9912, lng:32.8643, kapasite:12000, tip:"park"    },
  { id:"ank03", il:"Ankara",    ilce:"Etimesgut",      ad:"Etimesgut Meydan Parkı",        lat:39.9512, lng:32.6812, kapasite:10000, tip:"park"    },
  { id:"ank04", il:"Ankara",    ilce:"Mamak",          ad:"Mamak Spor Tesisi",             lat:39.9312, lng:32.9341, kapasite:8000,  tip:"spor"    },
  // ── İZMİR ─────────────────────────────────────────────────────────────────
  { id:"izm01", il:"İzmir",     ilce:"Konak",          ad:"Konak Meydanı",                 lat:38.4189, lng:27.1287, kapasite:15000, tip:"meydan"  },
  { id:"izm02", il:"İzmir",     ilce:"Karşıyaka",      ad:"Karşıyaka Sahil Parkı",         lat:38.4612, lng:27.1123, kapasite:10000, tip:"park"    },
  { id:"izm03", il:"İzmir",     ilce:"Bornova",        ad:"Bornova Millet Bahçesi",        lat:38.4712, lng:27.2212, kapasite:8000,  tip:"park"    },
  { id:"izm04", il:"İzmir",     ilce:"Buca",           ad:"Buca Spor Kompleksi",           lat:38.3812, lng:27.1812, kapasite:7000,  tip:"spor"    },
  // ── KAHRAMANMARAş ─────────────────────────────────────────────────────────
  { id:"kah01", il:"Kahramanmaraş", ilce:"Dulkadiroğlu",  ad:"Dulkadiroğlu Millet Bahçesi",   lat:37.5912, lng:36.9312, kapasite:12000, tip:"park"    },
  { id:"kah02", il:"Kahramanmaraş", ilce:"Onikişubat",    ad:"Onikişubat Stadyumu",           lat:37.5712, lng:36.9112, kapasite:8000,  tip:"stadyum" },
  { id:"kah03", il:"Kahramanmaraş", ilce:"Dulkadiroğlu",  ad:"Kapalı Spor Salonu Çevresi",    lat:37.5850, lng:36.9450, kapasite:5000,  tip:"spor"    },
  { id:"kah04", il:"Kahramanmaraş", ilce:"Türkoğlu",      ad:"Türkoğlu İlçe Meydanı",         lat:37.3812, lng:36.8512, kapasite:4000,  tip:"meydan"  },
  { id:"kah05", il:"Kahramanmaraş", ilce:"Elbistan",      ad:"Elbistan Atatürk Parkı",        lat:38.2012, lng:37.1912, kapasite:6000,  tip:"park"    },
  { id:"kah06", il:"Kahramanmaraş", ilce:"Afşin",         ad:"Afşin Meydan",                  lat:38.2512, lng:36.9112, kapasite:4000,  tip:"meydan"  },
  // ── HATAY ─────────────────────────────────────────────────────────────────
  { id:"hat01", il:"Hatay",     ilce:"Antakya",        ad:"Antakya Millet Bahçesi",        lat:36.2012, lng:36.1612, kapasite:15000, tip:"park"    },
  { id:"hat02", il:"Hatay",     ilce:"İskenderun",     ad:"İskenderun Sahil Parkı",        lat:36.5812, lng:36.1712, kapasite:12000, tip:"park"    },
  { id:"hat03", il:"Hatay",     ilce:"Kırıkhan",       ad:"Kırıkhan Stadyumu",             lat:36.4912, lng:36.3612, kapasite:5000,  tip:"stadyum" },
  { id:"hat04", il:"Hatay",     ilce:"Dörtyol",        ad:"Dörtyol Meydan Parkı",          lat:36.8412, lng:36.2212, kapasite:6000,  tip:"park"    },
  { id:"hat05", il:"Hatay",     ilce:"Reyhanlı",       ad:"Reyhanlı Meydan",               lat:36.2612, lng:36.5512, kapasite:5000,  tip:"meydan"  },
  { id:"hat06", il:"Hatay",     ilce:"Samandağ",       ad:"Samandağ Sahil Parkı",          lat:36.0712, lng:35.9812, kapasite:8000,  tip:"park"    },
  // ── MALATYA ───────────────────────────────────────────────────────────────
  { id:"mal01", il:"Malatya",   ilce:"Battalgazi",     ad:"Battalgazi Millet Bahçesi",     lat:38.3612, lng:38.3212, kapasite:12000, tip:"park"    },
  { id:"mal02", il:"Malatya",   ilce:"Yeşilyurt",      ad:"Yeşilyurt Spor Tesisi",         lat:38.3412, lng:38.2912, kapasite:7000,  tip:"spor"    },
  { id:"mal03", il:"Malatya",   ilce:"Battalgazi",     ad:"İnönü Stadyumu Çevresi",        lat:38.3512, lng:38.3112, kapasite:10000, tip:"stadyum" },
  { id:"mal04", il:"Malatya",   ilce:"Doğanşehir",     ad:"Doğanşehir Meydan",             lat:37.8812, lng:37.8712, kapasite:4000,  tip:"meydan"  },
  { id:"mal05", il:"Malatya",   ilce:"Akçadağ",        ad:"Akçadağ Parkı",                 lat:38.3412, lng:37.9712, kapasite:3000,  tip:"park"    },
  // ── GAZİANTEP ─────────────────────────────────────────────────────────────
  { id:"gaz01", il:"Gaziantep", ilce:"Şahinbey",       ad:"Gaziantep Millet Bahçesi",      lat:37.0712, lng:37.3812, kapasite:20000, tip:"park"    },
  { id:"gaz02", il:"Gaziantep", ilce:"Şehitkamil",     ad:"Şehitkamil Parkı",              lat:37.0912, lng:37.3512, kapasite:10000, tip:"park"    },
  { id:"gaz03", il:"Gaziantep", ilce:"Nurdağı",        ad:"Nurdağı Meydan",                lat:37.1712, lng:36.7312, kapasite:5000,  tip:"meydan"  },
  { id:"gaz04", il:"Gaziantep", ilce:"İslahiye",       ad:"İslahiye Stadyumu",             lat:37.0212, lng:36.6312, kapasite:6000,  tip:"stadyum" },
  { id:"gaz05", il:"Gaziantep", ilce:"Nizip",          ad:"Nizip Millet Bahçesi",          lat:37.0012, lng:37.7912, kapasite:8000,  tip:"park"    },
  // ── ADIYAMAN ──────────────────────────────────────────────────────────────
  { id:"ady01", il:"Adıyaman",  ilce:"Merkez",         ad:"Adıyaman Atatürk Stadı",        lat:37.7612, lng:38.2812, kapasite:8000,  tip:"stadyum" },
  { id:"ady02", il:"Adıyaman",  ilce:"Merkez",         ad:"Adıyaman Millet Bahçesi",       lat:37.7712, lng:38.2712, kapasite:10000, tip:"park"    },
  { id:"ady03", il:"Adıyaman",  ilce:"Kahta",          ad:"Kahta Meydan Parkı",            lat:37.7812, lng:38.6212, kapasite:5000,  tip:"park"    },
  { id:"ady04", il:"Adıyaman",  ilce:"Besni",          ad:"Besni Meydan",                  lat:37.6912, lng:37.8512, kapasite:4000,  tip:"meydan"  },
  // ── BURSA ─────────────────────────────────────────────────────────────────
  { id:"brs01", il:"Bursa",     ilce:"Osmangazi",      ad:"Kültürpark",                    lat:40.1912, lng:29.0612, kapasite:20000, tip:"park"    },
  { id:"brs02", il:"Bursa",     ilce:"Nilüfer",        ad:"Nilüfer Belediye Parkı",        lat:40.2112, lng:28.9812, kapasite:10000, tip:"park"    },
  // ── ANTALYA ───────────────────────────────────────────────────────────────
  { id:"ant01", il:"Antalya",   ilce:"Muratpaşa",      ad:"Atatürk Parkı",                 lat:36.8969, lng:30.7133, kapasite:12000, tip:"park"    },
  { id:"ant02", il:"Antalya",   ilce:"Kepez",          ad:"Kepez Millet Bahçesi",          lat:36.9412, lng:30.7012, kapasite:15000, tip:"park"    },
  { id:"ant03", il:"Antalya",   ilce:"Konyaaltı",      ad:"Konyaaltı Sahil Parkı",         lat:36.8712, lng:30.6312, kapasite:18000, tip:"park"    },
  // ── ADANA ─────────────────────────────────────────────────────────────────
  { id:"ada01", il:"Adana",     ilce:"Seyhan",         ad:"Seyhan Baraj Parkı",            lat:37.0012, lng:35.3212, kapasite:15000, tip:"park"    },
  { id:"ada02", il:"Adana",     ilce:"Çukurova",       ad:"Çukurova Üniversitesi Alanı",   lat:36.9912, lng:35.3612, kapasite:10000, tip:"spor"    },
  // ── KOCAELİ ───────────────────────────────────────────────────────────────
  { id:"koc01", il:"Kocaeli",   ilce:"İzmit",          ad:"İzmit Millet Bahçesi",          lat:40.7712, lng:29.9412, kapasite:15000, tip:"park"    },
  { id:"koc02", il:"Kocaeli",   ilce:"Gebze",          ad:"Gebze Stadyumu",                lat:40.8012, lng:29.4312, kapasite:8000,  tip:"stadyum" },
  // ── SAKARYA ───────────────────────────────────────────────────────────────
  { id:"sak01", il:"Sakarya",   ilce:"Adapazarı",      ad:"Adapazarı Millet Bahçesi",      lat:40.7812, lng:30.3912, kapasite:12000, tip:"park"    },
  // ── MERSİN ────────────────────────────────────────────────────────────────
  { id:"mer01", il:"Mersin",    ilce:"Yenişehir",      ad:"Mersin Sahil Parkı",            lat:36.8012, lng:34.6312, kapasite:20000, tip:"park"    },
  // ── SAMSUN ────────────────────────────────────────────────────────────────
  { id:"sam01", il:"Samsun",    ilce:"Atakum",         ad:"Atakum Sahil Parkı",            lat:41.3212, lng:36.2812, kapasite:15000, tip:"park"    },
  // ── ESKİŞEHİR ─────────────────────────────────────────────────────────────
  { id:"esk01", il:"Eskişehir", ilce:"Odunpazarı",     ad:"Odunpazarı Millet Bahçesi",     lat:39.7812, lng:30.5212, kapasite:12000, tip:"park"    },
  // ── DİYARBAKIR ────────────────────────────────────────────────────────────
  { id:"diy01", il:"Diyarbakır",ilce:"Bağlar",         ad:"Bağlar Millet Bahçesi",         lat:37.9212, lng:40.2012, kapasite:15000, tip:"park"    },
  // ── ŞANLIURFA ─────────────────────────────────────────────────────────────
  { id:"san01", il:"Şanlıurfa", ilce:"Eyyübiye",       ad:"Şanlıurfa Millet Bahçesi",      lat:37.1612, lng:38.7912, kapasite:18000, tip:"park"    },
  // ── VAN ───────────────────────────────────────────────────────────────────
  { id:"van01", il:"Van",       ilce:"İpekyolu",       ad:"Van Gölü Sahil Parkı",          lat:38.4912, lng:43.3812, kapasite:12000, tip:"park"    },
  // ── ERZURUM ───────────────────────────────────────────────────────────────
  { id:"erz01", il:"Erzurum",   ilce:"Yakutiye",       ad:"Yakutiye Millet Bahçesi",       lat:39.9112, lng:41.2712, kapasite:10000, tip:"park"    },
  // ── TRABZON ───────────────────────────────────────────────────────────────
  { id:"trb01", il:"Trabzon",   ilce:"Ortahisar",      ad:"Trabzon Meydan Parkı",          lat:41.0012, lng:39.7212, kapasite:8000,  tip:"park"    },
  // ── DENİZLİ ───────────────────────────────────────────────────────────────
  { id:"den01", il:"Denizli",   ilce:"Pamukkale",      ad:"Pamukkale Millet Bahçesi",      lat:37.7812, lng:29.0912, kapasite:10000, tip:"park"    },
  // ── MUĞLA ─────────────────────────────────────────────────────────────────
  { id:"mug01", il:"Muğla",     ilce:"Menteşe",        ad:"Muğla Millet Bahçesi",          lat:37.2112, lng:28.3612, kapasite:8000,  tip:"park"    },
  // ── ÇANAKKALE ─────────────────────────────────────────────────────────────
  { id:"can01", il:"Çanakkale", ilce:"Merkez",         ad:"Çanakkale Sahil Parkı",         lat:40.1512, lng:26.4112, kapasite:8000,  tip:"park"    },
  // ── BOLU ──────────────────────────────────────────────────────────────────
  { id:"bol01", il:"Bolu",      ilce:"Merkez",         ad:"Bolu Millet Bahçesi",           lat:40.7312, lng:31.6012, kapasite:8000,  tip:"park"    },
  // ── DÜZCE ─────────────────────────────────────────────────────────────────
  { id:"duz01", il:"Düzce",     ilce:"Merkez",         ad:"Düzce Atatürk Stadı",           lat:40.8412, lng:31.1612, kapasite:6000,  tip:"stadyum" },
  // ── KONYA ─────────────────────────────────────────────────────────────────
  { id:"kon01", il:"Konya",     ilce:"Selçuklu",       ad:"Selçuklu Millet Bahçesi",       lat:37.9012, lng:32.4912, kapasite:20000, tip:"park"    },
  { id:"kon02", il:"Konya",     ilce:"Karatay",        ad:"Karatay Parkı",                 lat:37.8812, lng:32.5112, kapasite:8000,  tip:"park"    },
  // ── KAYSERI ───────────────────────────────────────────────────────────────
  { id:"kay01", il:"Kayseri",   ilce:"Melikgazi",      ad:"Melikgazi Millet Bahçesi",      lat:38.7312, lng:35.4712, kapasite:15000, tip:"park"    },
  { id:"kay02", il:"Kayseri",   ilce:"Kocasinan",      ad:"Kocasinan Stadyumu",            lat:38.7512, lng:35.4912, kapasite:10000, tip:"stadyum" },
  // ── ZONGULDAK ─────────────────────────────────────────────────────────────
  { id:"zon01", il:"Zonguldak", ilce:"Merkez",         ad:"Zonguldak Millet Bahçesi",      lat:41.4512, lng:31.7912, kapasite:8000,  tip:"park"    },
  // ── KASTAMONU ─────────────────────────────────────────────────────────────
  { id:"kas01", il:"Kastamonu", ilce:"Merkez",         ad:"Kastamonu Millet Bahçesi",      lat:41.3712, lng:33.7812, kapasite:6000,  tip:"park"    },
  // ── SİNOP ─────────────────────────────────────────────────────────────────
  { id:"sin01", il:"Sinop",     ilce:"Merkez",         ad:"Sinop Sahil Parkı",             lat:42.0212, lng:35.1512, kapasite:5000,  tip:"park"    },
  // ── ORDU ──────────────────────────────────────────────────────────────────
  { id:"ord01", il:"Ordu",      ilce:"Altınordu",      ad:"Ordu Sahil Parkı",              lat:40.9812, lng:37.8812, kapasite:10000, tip:"park"    },
  // ── GİRESUN ───────────────────────────────────────────────────────────────
  { id:"gir01", il:"Giresun",   ilce:"Merkez",         ad:"Giresun Sahil Parkı",           lat:40.9112, lng:38.3912, kapasite:7000,  tip:"park"    },
  // ── RİZE ──────────────────────────────────────────────────────────────────
  { id:"riz01", il:"Rize",      ilce:"Merkez",         ad:"Rize Millet Bahçesi",           lat:41.0212, lng:40.5212, kapasite:6000,  tip:"park"    },
  // ── ARTVİN ────────────────────────────────────────────────────────────────
  { id:"art01", il:"Artvin",    ilce:"Merkez",         ad:"Artvin Meydan Parkı",           lat:41.1812, lng:41.8212, kapasite:4000,  tip:"park"    },
  // ── AĞRI ──────────────────────────────────────────────────────────────────
  { id:"agr01", il:"Ağrı",      ilce:"Merkez",         ad:"Ağrı Millet Bahçesi",           lat:39.7212, lng:43.0512, kapasite:6000,  tip:"park"    },
  // ── IĞDIR ─────────────────────────────────────────────────────────────────
  { id:"igd01", il:"Iğdır",     ilce:"Merkez",         ad:"Iğdır Meydan Parkı",            lat:39.9212, lng:44.0412, kapasite:5000,  tip:"meydan"  },
  // ── KARS ──────────────────────────────────────────────────────────────────
  { id:"kar01", il:"Kars",      ilce:"Merkez",         ad:"Kars Millet Bahçesi",           lat:40.6012, lng:43.0912, kapasite:6000,  tip:"park"    },
  // ── ARDAHAN ───────────────────────────────────────────────────────────────
  { id:"ard01", il:"Ardahan",   ilce:"Merkez",         ad:"Ardahan Meydan",                lat:41.1112, lng:42.7012, kapasite:3000,  tip:"meydan"  },
  // ── MUŞ ───────────────────────────────────────────────────────────────────
  { id:"mus01", il:"Muş",       ilce:"Merkez",         ad:"Muş Millet Bahçesi",            lat:38.7412, lng:41.4912, kapasite:6000,  tip:"park"    },
  // ── BİTLİS ────────────────────────────────────────────────────────────────
  { id:"bit01", il:"Bitlis",    ilce:"Merkez",         ad:"Bitlis Meydan Parkı",           lat:38.3912, lng:42.1212, kapasite:4000,  tip:"park"    },
  // ── SİİRT ─────────────────────────────────────────────────────────────────
  { id:"sii01", il:"Siirt",     ilce:"Merkez",         ad:"Siirt Millet Bahçesi",          lat:37.9312, lng:41.9412, kapasite:5000,  tip:"park"    },
  // ── ŞIRNAK ────────────────────────────────────────────────────────────────
  { id:"sir01", il:"Şırnak",    ilce:"Merkez",         ad:"Şırnak Meydan Parkı",           lat:37.5112, lng:42.4612, kapasite:4000,  tip:"meydan"  },
  // ── HAKKARİ ───────────────────────────────────────────────────────────────
  { id:"hak01", il:"Hakkari",   ilce:"Merkez",         ad:"Hakkari Meydan",                lat:37.5712, lng:43.7412, kapasite:3000,  tip:"meydan"  },
  // ── MARDİN ────────────────────────────────────────────────────────────────
  { id:"mar01", il:"Mardin",    ilce:"Artuklu",        ad:"Mardin Millet Bahçesi",         lat:37.3112, lng:40.7312, kapasite:8000,  tip:"park"    },
  // ── BATMAN ────────────────────────────────────────────────────────────────
  { id:"bat01", il:"Batman",    ilce:"Merkez",         ad:"Batman Millet Bahçesi",         lat:37.8812, lng:41.1312, kapasite:8000,  tip:"park"    },
  // ── BINGÖL ────────────────────────────────────────────────────────────────
  { id:"bin01", il:"Bingöl",    ilce:"Merkez",         ad:"Bingöl Millet Bahçesi",         lat:38.8812, lng:40.4912, kapasite:5000,  tip:"park"    },
  // ── TUNCELİ ───────────────────────────────────────────────────────────────
  { id:"tun01", il:"Tunceli",   ilce:"Merkez",         ad:"Tunceli Meydan Parkı",          lat:39.1012, lng:39.5412, kapasite:3000,  tip:"meydan"  },
  // ── ELAZIĞ ────────────────────────────────────────────────────────────────
  { id:"ela01", il:"Elazığ",    ilce:"Merkez",         ad:"Elazığ Millet Bahçesi",         lat:38.6712, lng:39.2212, kapasite:10000, tip:"park"    },
  // ── KIRIKKALE ─────────────────────────────────────────────────────────────
  { id:"kir01", il:"Kırıkkale", ilce:"Merkez",         ad:"Kırıkkale Millet Bahçesi",      lat:39.8412, lng:33.5112, kapasite:7000,  tip:"park"    },
  // ── AKSARAY ───────────────────────────────────────────────────────────────
  { id:"aks01", il:"Aksaray",   ilce:"Merkez",         ad:"Aksaray Millet Bahçesi",        lat:38.3712, lng:34.0312, kapasite:8000,  tip:"park"    },
  // ── NİĞDE ─────────────────────────────────────────────────────────────────
  { id:"nig01", il:"Niğde",     ilce:"Merkez",         ad:"Niğde Millet Bahçesi",          lat:37.9712, lng:34.6812, kapasite:7000,  tip:"park"    },
  // ── NEVŞEHİR ──────────────────────────────────────────────────────────────
  { id:"nev01", il:"Nevşehir",  ilce:"Merkez",         ad:"Nevşehir Millet Bahçesi",       lat:38.6212, lng:34.7112, kapasite:6000,  tip:"park"    },
  // ── KIRŞEHİR ──────────────────────────────────────────────────────────────
  { id:"krs01", il:"Kırşehir",  ilce:"Merkez",         ad:"Kırşehir Millet Bahçesi",       lat:39.1412, lng:34.1612, kapasite:6000,  tip:"park"    },
  // ── YOZGAT ────────────────────────────────────────────────────────────────
  { id:"yoz01", il:"Yozgat",    ilce:"Merkez",         ad:"Yozgat Millet Bahçesi",         lat:39.8212, lng:34.8112, kapasite:6000,  tip:"park"    },
  // ── ÇORUM ─────────────────────────────────────────────────────────────────
  { id:"cor01", il:"Çorum",     ilce:"Merkez",         ad:"Çorum Millet Bahçesi",          lat:40.5512, lng:34.9512, kapasite:8000,  tip:"park"    },
  // ── AMASYA ────────────────────────────────────────────────────────────────
  { id:"ama01", il:"Amasya",    ilce:"Merkez",         ad:"Amasya Sahil Parkı",            lat:40.6512, lng:35.8312, kapasite:6000,  tip:"park"    },
  // ── TOKAT ─────────────────────────────────────────────────────────────────
  { id:"tok01", il:"Tokat",     ilce:"Merkez",         ad:"Tokat Millet Bahçesi",          lat:40.3112, lng:36.5512, kapasite:7000,  tip:"park"    },
  // ── BAYBURT ───────────────────────────────────────────────────────────────
  { id:"bay01", il:"Bayburt",   ilce:"Merkez",         ad:"Bayburt Meydan Parkı",          lat:40.2512, lng:40.2212, kapasite:3000,  tip:"meydan"  },
  // ── GÜMÜŞHANe ─────────────────────────────────────────────────────────────
  { id:"gum01", il:"Gümüşhane", ilce:"Merkez",         ad:"Gümüşhane Millet Bahçesi",      lat:40.4612, lng:39.4812, kapasite:4000,  tip:"park"    },
  // ── KARABÜK ───────────────────────────────────────────────────────────────
  { id:"krb01", il:"Karabük",   ilce:"Merkez",         ad:"Karabük Millet Bahçesi",        lat:41.2012, lng:32.6212, kapasite:6000,  tip:"park"    },
  // ── BARTIN ────────────────────────────────────────────────────────────────
  { id:"brt01", il:"Bartın",    ilce:"Merkez",         ad:"Bartın Millet Bahçesi",         lat:41.6312, lng:32.3412, kapasite:5000,  tip:"park"    },
  // ── ÇANKIRI ───────────────────────────────────────────────────────────────
  { id:"cnk01", il:"Çankırı",   ilce:"Merkez",         ad:"Çankırı Millet Bahçesi",        lat:40.6012, lng:33.6212, kapasite:5000,  tip:"park"    },
  // ── KIRKLARELI ────────────────────────────────────────────────────────────
  { id:"krl01", il:"Kırklareli",ilce:"Merkez",         ad:"Kırklareli Millet Bahçesi",     lat:41.7312, lng:27.2212, kapasite:5000,  tip:"park"    },
  // ── EDİRNE ────────────────────────────────────────────────────────────────
  { id:"edi01", il:"Edirne",    ilce:"Merkez",         ad:"Edirne Millet Bahçesi",         lat:41.6712, lng:26.5512, kapasite:8000,  tip:"park"    },
  // ── TEKİRDAĞ ──────────────────────────────────────────────────────────────
  { id:"tek01", il:"Tekirdağ",  ilce:"Süleymanpaşa",   ad:"Tekirdağ Sahil Parkı",          lat:40.9812, lng:27.5112, kapasite:10000, tip:"park"    },
  // ── BALIKESİR ─────────────────────────────────────────────────────────────
  { id:"bal01", il:"Balıkesir", ilce:"Altıeylül",      ad:"Balıkesir Millet Bahçesi",      lat:39.6512, lng:27.8812, kapasite:10000, tip:"park"    },
  // ── MANİSA ────────────────────────────────────────────────────────────────
  { id:"man01", il:"Manisa",    ilce:"Şehzadeler",     ad:"Manisa Millet Bahçesi",         lat:38.6112, lng:27.4312, kapasite:10000, tip:"park"    },
  // ── AYDIN ─────────────────────────────────────────────────────────────────
  { id:"ayd01", il:"Aydın",     ilce:"Efeler",         ad:"Aydın Millet Bahçesi",          lat:37.8512, lng:27.8412, kapasite:10000, tip:"park"    },
  // ── UŞAK ──────────────────────────────────────────────────────────────────
  { id:"usa01", il:"Uşak",      ilce:"Merkez",         ad:"Uşak Millet Bahçesi",           lat:38.6812, lng:29.4012, kapasite:7000,  tip:"park"    },
  // ── AFYONKARAHİSAR ────────────────────────────────────────────────────────
  { id:"afy01", il:"Afyonkarahisar", ilce:"Merkez",    ad:"Afyon Millet Bahçesi",          lat:38.7612, lng:30.5412, kapasite:8000,  tip:"park"    },
  // ── ISPARTA ───────────────────────────────────────────────────────────────
  { id:"isp01", il:"Isparta",   ilce:"Merkez",         ad:"Isparta Millet Bahçesi",        lat:37.7612, lng:30.5512, kapasite:8000,  tip:"park"    },
  // ── BURDUR ────────────────────────────────────────────────────────────────
  { id:"bur01", il:"Burdur",    ilce:"Merkez",         ad:"Burdur Millet Bahçesi",         lat:37.7212, lng:30.2912, kapasite:6000,  tip:"park"    },
  // ── KARAMAN ───────────────────────────────────────────────────────────────
  { id:"krm01", il:"Karaman",   ilce:"Merkez",         ad:"Karaman Millet Bahçesi",        lat:37.1812, lng:33.2212, kapasite:7000,  tip:"park"    },
  // ── OSMANİYE ──────────────────────────────────────────────────────────────
  { id:"osm01", il:"Osmaniye",  ilce:"Merkez",         ad:"Osmaniye Millet Bahçesi",       lat:37.0712, lng:36.2412, kapasite:7000,  tip:"park"    },
  // ── K.MARAŞ EK ────────────────────────────────────────────────────────────
  { id:"kah07", il:"Kahramanmaraş", ilce:"Pazarcık",   ad:"Pazarcık Meydan Parkı",         lat:37.4912, lng:37.2912, kapasite:4000,  tip:"meydan"  },
  { id:"kah08", il:"Kahramanmaraş", ilce:"Göksun",     ad:"Göksun Meydan",                 lat:38.0212, lng:36.4912, kapasite:3000,  tip:"meydan"  },
  // ── İSTANBUL EK ───────────────────────────────────────────────────────────
  { id:"ist10", il:"İstanbul",  ilce:"Sarıyer",        ad:"Sarıyer Sahil Parkı",           lat:41.1612, lng:29.0512, kapasite:8000,  tip:"park"    },
  { id:"ist11", il:"İstanbul",  ilce:"Silivri",        ad:"Silivri Sahil Parkı",           lat:41.0712, lng:28.2512, kapasite:10000, tip:"park"    },
  { id:"ist12", il:"İstanbul",  ilce:"Tuzla",          ad:"Tuzla Millet Bahçesi",          lat:40.8212, lng:29.3012, kapasite:8000,  tip:"park"    },
  { id:"ist13", il:"İstanbul",  ilce:"Eyüpsultan",     ad:"Eyüpsultan Millet Bahçesi",     lat:41.0512, lng:28.9312, kapasite:12000, tip:"park"    },
  { id:"ist14", il:"İstanbul",  ilce:"Sultanbeyli",    ad:"Sultanbeyli Meydan Parkı",      lat:40.9612, lng:29.2712, kapasite:7000,  tip:"meydan"  },
  // ── ANKARA EK ─────────────────────────────────────────────────────────────
  { id:"ank05", il:"Ankara",    ilce:"Sincan",         ad:"Sincan Millet Bahçesi",         lat:39.9712, lng:32.5812, kapasite:10000, tip:"park"    },
  { id:"ank06", il:"Ankara",    ilce:"Altındağ",       ad:"Altındağ Meydan Parkı",         lat:39.9512, lng:32.8912, kapasite:7000,  tip:"meydan"  },
  // ── HATAY EK ──────────────────────────────────────────────────────────────
  { id:"hat07", il:"Hatay",     ilce:"Payas",          ad:"Payas Sahil Parkı",             lat:36.7512, lng:36.1612, kapasite:5000,  tip:"park"    },
  { id:"hat08", il:"Hatay",     ilce:"Altınözü",       ad:"Altınözü Meydan",               lat:36.0912, lng:36.2312, kapasite:3000,  tip:"meydan"  },
];

export const TIP_META = {
  park:    { icon: "🌳", color: "#22c55e", label: "Park / Bahçe" },
  okul:    { icon: "🏫", color: "#3b82f6", label: "Okul Bahçesi" },
  stadyum: { icon: "🏟", color: "#f59e0b", label: "Stadyum"      },
  meydan:  { icon: "🏛", color: "#8b5cf6", label: "Meydan"       },
  spor:    { icon: "⚽", color: "#06b6d4", label: "Spor Tesisi"  },
};

// SVG pin ikonu — google.maps.Marker için data URI
function pinSvg(color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
    <circle cx="14" cy="14" r="6" fill="#fff" fill-opacity="0.9"/>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

export function initToplanmaAlanlari(map) {
  const markers = [];
  const infoWindows = [];
  let activeIW = null;

  for (const alan of TOPLANMA_ALANLARI) {
    const meta = TIP_META[alan.tip] || TIP_META.park;

    // google.maps.Marker — mapId gerekmez, her zaman çalışır
    const marker = new google.maps.Marker({
      position: { lat: alan.lat, lng: alan.lng },
      map,
      title: alan.ad,
      icon: {
        url: pinSvg(meta.color),
        scaledSize: new google.maps.Size(28, 36),
        anchor: new google.maps.Point(14, 36),
      },
      zIndex: 20,
    });

    const iw = new google.maps.InfoWindow({
      content: `<div style="background:#0f172a;color:#f1f5f9;padding:10px 12px;
        border-radius:8px;font-family:Inter,sans-serif;font-size:12px;
        min-width:200px;border:1px solid ${meta.color}66;">
        <div style="color:${meta.color};font-weight:700;margin-bottom:5px;font-size:13px">
          ${meta.icon} ${esc(alan.ad)}
        </div>
        <div style="color:#94a3b8;line-height:1.8">
          <b style="color:#cbd5e1">${esc(alan.il)}</b> / ${esc(alan.ilce)}<br>
          ${meta.label} · ~${alan.kapasite.toLocaleString("tr-TR")} kişi<br>
          <span style="color:#22d3ee;font-size:11px">📍 AFET TOPLANMA ALANI</span>
        </div>
      </div>`,
    });

    marker.addListener("click", () => {
      if (activeIW) activeIW.close();
      iw.open(map, marker);
      activeIW = iw;
    });

    markers.push(marker);
    infoWindows.push(iw);
  }

  return {
    markers,

    /** Tüm marker'ları göster */
    showAll() {
      markers.forEach((m) => m.setMap(map));
    },

    /** Tüm marker'ları gizle */
    hideAll() {
      if (activeIW) activeIW.close();
      markers.forEach((m) => m.setMap(null));
    },

    /** Predicate veya string ile filtrele */
    filter(queryOrFn) {
      const fn = typeof queryOrFn === "function"
        ? queryOrFn
        : (a) => {
            if (queryOrFn === "__HIDE_ALL__") return false;
            const q = (queryOrFn || "").toLowerCase().trim();
            return !q || a.il.toLowerCase().includes(q) ||
              a.ilce.toLowerCase().includes(q) || a.ad.toLowerCase().includes(q);
          };
      markers.forEach((m, i) => m.setMap(fn(TOPLANMA_ALANLARI[i]) ? map : null));
    },

    /** Belirli alana zoom yap */
    zoomTo(id) {
      const idx = TOPLANMA_ALANLARI.findIndex((a) => a.id === id);
      if (idx === -1) return;
      const a = TOPLANMA_ALANLARI[idx];
      map.setCenter({ lat: a.lat, lng: a.lng });
      map.setZoom(15);
      if (activeIW) activeIW.close();
      infoWindows[idx].open(map, markers[idx]);
      activeIW = infoWindows[idx];
    },
  };
}

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
