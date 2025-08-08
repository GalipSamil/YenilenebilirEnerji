using YenilenebilirEnerji.Domain.Entities;

namespace YenilenebilirEnerji.Infrastructure.Data
{
    public static class RegionSeedData
    {
        public static void SeedRegions(ApplicationDbContext context)
        {
            if (context.Regions.Any())
                return;

            var regions = new List<Region>
            {
                // Güneş Enerjisi Bölgeleri (20 bölge)
                new Region { Name = "Konya", Latitude = 37.8667, Longitude = 32.4833, EnergyType = "solar", Capacity = 1000, Description = "Türkiye'nin en büyük güneş enerjisi bölgesi" },
                new Region { Name = "Antalya", Latitude = 36.8969, Longitude = 30.7133, EnergyType = "solar", Capacity = 800, Description = "Akdeniz'in güneşli kenti" },
                new Region { Name = "Mersin", Latitude = 36.8, Longitude = 34.6333, EnergyType = "solar", Capacity = 1200, Description = "Güney'in güneş enerjisi merkezi" },
                new Region { Name = "Şanlıurfa", Latitude = 37.1591, Longitude = 38.7969, EnergyType = "solar", Capacity = 1500, Description = "GAP bölgesinin güneş enerjisi" },
                new Region { Name = "İzmir Solar", Latitude = 38.4237, Longitude = 27.1428, EnergyType = "solar", Capacity = 600, Description = "Ege'nin güneş enerjisi" },
                new Region { Name = "Adana", Latitude = 37.0, Longitude = 35.3213, EnergyType = "solar", Capacity = 900, Description = "Çukurova'nın güneş enerjisi" },
                new Region { Name = "Gaziantep", Latitude = 37.0662, Longitude = 37.3833, EnergyType = "solar", Capacity = 700, Description = "Güneydoğu'nun güneş enerjisi" },
                new Region { Name = "Diyarbakır", Latitude = 37.9144, Longitude = 40.2306, EnergyType = "solar", Capacity = 1100, Description = "Güneydoğu'nun güneş enerjisi merkezi" },
                new Region { Name = "Kayseri", Latitude = 38.7205, Longitude = 35.4826, EnergyType = "solar", Capacity = 800, Description = "İç Anadolu'nun güneş enerjisi" },
                new Region { Name = "Sivas", Latitude = 39.7477, Longitude = 37.0179, EnergyType = "solar", Capacity = 600, Description = "Doğu Anadolu'nun güneş enerjisi" },
                new Region { Name = "Malatya", Latitude = 38.3552, Longitude = 38.3095, EnergyType = "solar", Capacity = 700, Description = "Malatya güneş enerjisi" },
                new Region { Name = "Elazığ", Latitude = 38.6810, Longitude = 39.2264, EnergyType = "solar", Capacity = 500, Description = "Elazığ güneş enerjisi" },
                new Region { Name = "Van", Latitude = 38.4891, Longitude = 43.4089, EnergyType = "solar", Capacity = 400, Description = "Van güneş enerjisi" },
                new Region { Name = "Erzurum", Latitude = 39.9055, Longitude = 41.2658, EnergyType = "solar", Capacity = 300, Description = "Erzurum güneş enerjisi" },
                new Region { Name = "Trabzon", Latitude = 41.0015, Longitude = 39.7178, EnergyType = "solar", Capacity = 200, Description = "Karadeniz güneş enerjisi" },
                new Region { Name = "Samsun", Latitude = 41.2867, Longitude = 36.3300, EnergyType = "solar", Capacity = 300, Description = "Samsun güneş enerjisi" },
                new Region { Name = "Bursa Solar", Latitude = 40.1885, Longitude = 29.0610, EnergyType = "solar", Capacity = 400, Description = "Bursa güneş enerjisi" },
                new Region { Name = "Eskişehir", Latitude = 39.7767, Longitude = 30.5206, EnergyType = "solar", Capacity = 300, Description = "Eskişehir güneş enerjisi" },
                new Region { Name = "Ankara", Latitude = 39.9334, Longitude = 32.8597, EnergyType = "solar", Capacity = 500, Description = "Ankara güneş enerjisi" },
                new Region { Name = "Kırıkkale", Latitude = 39.8468, Longitude = 33.5153, EnergyType = "solar", Capacity = 200, Description = "Kırıkkale güneş enerjisi" },

                // Rüzgar Enerjisi Bölgeleri (15 bölge)
                new Region { Name = "Bandırma", Latitude = 40.35, Longitude = 27.97, EnergyType = "wind", Capacity = 2000, Description = "Marmara'nın rüzgar enerjisi merkezi" },
                new Region { Name = "Çanakkale Wind", Latitude = 40.1553, Longitude = 26.4142, EnergyType = "wind", Capacity = 1500, Description = "Çanakkale Boğazı rüzgar enerjisi" },
                new Region { Name = "Soma", Latitude = 39.1889, Longitude = 27.6053, EnergyType = "wind", Capacity = 1800, Description = "Manisa'nın rüzgar enerjisi" },
                new Region { Name = "Balıkesir Wind", Latitude = 39.6484, Longitude = 27.8826, EnergyType = "wind", Capacity = 1600, Description = "Balıkesir rüzgar enerjisi" },
                new Region { Name = "İzmir Wind", Latitude = 38.4237, Longitude = 27.1428, EnergyType = "wind", Capacity = 1200, Description = "Ege'nin rüzgar enerjisi" },
                new Region { Name = "Hatay", Latitude = 36.2023, Longitude = 36.1613, EnergyType = "wind", Capacity = 800, Description = "Hatay rüzgar enerjisi" },
                new Region { Name = "Osmaniye", Latitude = 37.0742, Longitude = 36.2500, EnergyType = "wind", Capacity = 600, Description = "Osmaniye rüzgar enerjisi" },
                new Region { Name = "Kırklareli", Latitude = 41.7333, Longitude = 27.2167, EnergyType = "wind", Capacity = 1000, Description = "Trakya'nın rüzgar enerjisi" },
                new Region { Name = "Tekirdağ", Latitude = 40.9781, Longitude = 27.5117, EnergyType = "wind", Capacity = 1200, Description = "Tekirdağ rüzgar enerjisi" },
                new Region { Name = "Edirne", Latitude = 41.6771, Longitude = 26.5557, EnergyType = "wind", Capacity = 800, Description = "Edirne rüzgar enerjisi" },
                new Region { Name = "Gelibolu", Latitude = 40.4070, Longitude = 26.6707, EnergyType = "wind", Capacity = 600, Description = "Gelibolu rüzgar enerjisi" },
                new Region { Name = "Biga", Latitude = 40.2281, Longitude = 27.2422, EnergyType = "wind", Capacity = 400, Description = "Biga rüzgar enerjisi" },
                new Region { Name = "Ayvalık", Latitude = 39.3171, Longitude = 26.6950, EnergyType = "wind", Capacity = 500, Description = "Ayvalık rüzgar enerjisi" },
                new Region { Name = "Dikili", Latitude = 39.0711, Longitude = 26.8889, EnergyType = "wind", Capacity = 300, Description = "Dikili rüzgar enerjisi" },
                new Region { Name = "Aliağa", Latitude = 38.7992, Longitude = 26.9720, EnergyType = "wind", Capacity = 400, Description = "Aliağa rüzgar enerjisi" },

                // Jeotermal Enerji Bölgeleri (10 bölge)
                new Region { Name = "Aydın", Latitude = 37.8560, Longitude = 27.8416, EnergyType = "geothermal", Capacity = 500, Description = "Aydın jeotermal enerji" },
                new Region { Name = "Denizli", Latitude = 37.7765, Longitude = 29.0864, EnergyType = "geothermal", Capacity = 400, Description = "Denizli jeotermal enerji" },
                new Region { Name = "Manisa", Latitude = 38.6191, Longitude = 27.4289, EnergyType = "geothermal", Capacity = 300, Description = "Manisa jeotermal enerji" },
                new Region { Name = "İzmir Geothermal", Latitude = 38.4237, Longitude = 27.1428, EnergyType = "geothermal", Capacity = 200, Description = "İzmir jeotermal enerji" },
                new Region { Name = "Afyonkarahisar", Latitude = 38.7507, Longitude = 30.5567, EnergyType = "geothermal", Capacity = 250, Description = "Afyon jeotermal enerji" },
                new Region { Name = "Kütahya", Latitude = 39.4167, Longitude = 29.9833, EnergyType = "geothermal", Capacity = 150, Description = "Kütahya jeotermal enerji" },
                new Region { Name = "Bursa Geothermal", Latitude = 40.1885, Longitude = 29.0610, EnergyType = "geothermal", Capacity = 100, Description = "Bursa jeotermal enerji" },
                new Region { Name = "Balıkesir Geothermal", Latitude = 39.6484, Longitude = 27.8826, EnergyType = "geothermal", Capacity = 80, Description = "Balıkesir jeotermal enerji" },
                new Region { Name = "Çanakkale Geothermal", Latitude = 40.1553, Longitude = 26.4142, EnergyType = "geothermal", Capacity = 60, Description = "Çanakkale jeotermal enerji" },
                new Region { Name = "İstanbul", Latitude = 41.0082, Longitude = 28.9784, EnergyType = "geothermal", Capacity = 40, Description = "İstanbul jeotermal enerji" }
            };

            context.Regions.AddRange(regions);
            context.SaveChanges();
        }
    }
} 