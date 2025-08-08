<<<<<<< HEAD
# Yenilenebilir Enerji Santralları Yönetim Sistemi

Bu proje, yenilenebilir enerji santrallerinin (rüzgar, güneş, hidroelektrik) yönetimi ve üretim takibi için geliştirilmiş modern bir web uygulamasıdır.

## 🚀 Özellikler

- **Enerji Santrali Yönetimi**: Farklı tipteki santrallerin kaydı ve yönetimi
- **Gerçek Zamanlı Üretim Takibi**: Enerji üretim verilerinin anlık izlenmesi
- **Hava Durumu Entegrasyonu**: Meteorolojik verilerin santral performansına etkisi
- **Coğrafi Konum Servisleri**: Santrallerin harita üzerinde görüntülenmesi
- **İstatistiksel Raporlama**: Üretim verileri ve performans analizi
- **RESTful API**: Modern API tasarımı ile esnek entegrasyon

## 🛠️ Teknoloji Stack

### Backend
- **.NET Core 6.0** - Modern, yüksek performanslı web API
- **ASP.NET Core Web API** - RESTful servisler
- **Entity Framework Core** - ORM ve veritabanı yönetimi
- **Clean Architecture** - Katmanlı mimari
- **Domain-Driven Design** - İş mantığı organizasyonu
- **JWT Authentication** - Güvenli kimlik doğrulama
- **Swagger/OpenAPI** - API dokümantasyonu
- **Serilog** - Structured logging

### Frontend
- **React 18** - Modern kullanıcı arayüzü
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Veri görselleştirme
- **Leaflet** - Harita entegrasyonu
- **Framer Motion** - Animasyonlar
- **Axios** - HTTP client

### Geliştirme Araçları
- **Docker** - Containerization
- **xUnit** - Unit testing
- **Moq** - Mocking framework

## 📁 Proje Yapısı

```
YenilenebilirEnerji/
├── backend/
│   └── src/
│       ├── YenilenebilirEnerji.API/          # Web API katmanı
│       ├── YenilenebilirEnerji.Application/   # Uygulama servisleri
│       ├── YenilenebilirEnerji.Domain/        # Domain modelleri
│       └── YenilenebilirEnerji.Infrastructure/ # Altyapı servisleri
├── frontend/
│   ├── src/
│   │   ├── components/     # React bileşenleri
│   │   ├── pages/         # Sayfa bileşenleri
│   │   ├── services/      # API servisleri
│   │   └── types/         # TypeScript tipleri
│   └── public/            # Statik dosyalar
└── README.md
```

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- .NET 6.0 SDK
- Node.js 16+ ve npm
- SQL Server (opsiyonel - InMemory database kullanılabilir)

### Backend Kurulumu

```bash
# Backend dizinine gidin
cd backend/src/YenilenebilirEnerji.API

# Paketleri restore edin
dotnet restore

# Uygulamayı çalıştırın
dotnet run
```

Backend şu adreslerde çalışacak:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger: `https://localhost:5001/swagger`

### Frontend Kurulumu

```bash
# Frontend dizinine gidin
cd frontend

# Bağımlılıkları yükleyin
npm install

# Uygulamayı çalıştırın
npm start
```

Frontend şu adreste çalışacak:
- `http://localhost:3000`

## 📖 API Endpoints

### Enerji Santralleri
- `GET /api/energy/plants` - Tüm santralleri listele
- `GET /api/energy/plants/{id}` - Belirli santral bilgisi
- `GET /api/energy/plants/type/{type}` - Tipe göre santraller
- `POST /api/energy/plants` - Yeni santral oluştur
- `PUT /api/energy/plants/{id}/status` - Santral durumu güncelle

### Üretim Verileri
- `GET /api/energy/production/{plantId}` - Üretim verisi
- `GET /api/energy/production/{plantId}/history` - Üretim geçmişi
- `GET /api/energy/production/total` - Toplam üretim
- `GET /api/energy/production/by-type` - Tipe göre üretim

### Hava Durumu
- `GET /api/energy/weather/{lat}/{lng}` - Konum bazlı hava durumu

### Coğrafi Servisler
- `GET /api/energy/nearby/{lat}/{lng}` - Yakındaki santraller

## 🏗️ Mimari

Proje Clean Architecture prensiplerine uygun olarak geliştirilmiştir:

- **Domain Layer**: Core business logic ve entities
- **Application Layer**: Use cases ve business rules
- **Infrastructure Layer**: External concerns (database, APIs)
- **Presentation Layer**: Web API controllers

## 🧪 Test

```bash
# Backend testleri
cd backend/src/YenilenebilirEnerji.Tests
dotnet test

# Frontend testleri
cd frontend
npm test
```

## 🐳 Docker

```bash
# Backend için Docker image oluştur
cd backend/src/YenilenebilirEnerji.API
docker build -t yenilenebilir-enerji-api .

# Frontend için Docker image oluştur
cd frontend
docker build -t yenilenebilir-enerji-ui .
```

## 📊 Özellikler

### Santral Tipleri
- **Rüzgar Enerjisi**: Rüzgar santralları yönetimi
- **Güneş Enerjisi**: Fotovoltaik santral takibi
- **Hidroelektrik**: Su santralları yönetimi

### Veri Görselleştirme
- Gerçek zamanlı üretim grafikleri
- Tarihsel performans analizi
- Santral bazlı karşılaştırmalar
- Hava durumu korelasyonu

### Harita Entegrasyonu
- Santrallerin coğrafi konumları
- Üretim verilerinin harita üzerinde gösterimi
- Yakındaki santrallerin tespiti

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'e push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje Sahibi - [GitHub Profiliniz]

Proje Link: [https://github.com/kullaniciadi/YenilenebilirEnerji](https://github.com/kullaniciadi/YenilenebilirEnerji) 
=======
# YenilenebilirEnerji
Yenilenebilir Enerji Santralları Yönetim Sistemi .NET Core Web API ve React frontend ile geliştirilmiş modern enerji santrali yönetim uygulaması
>>>>>>> 1f60c6502caccc4c1f391daa4bbaf136e67fcd23
