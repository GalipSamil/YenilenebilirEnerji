using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace YenilenebilirEnerji.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeiasController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<TeiasController> _logger;

        public TeiasController(HttpClient httpClient, ILogger<TeiasController> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        [HttpGet("real-time-production")]
        public async Task<ActionResult> GetRealTimeProduction()
        {
            try
            {
                // Türkiye'nin farklı bölgelerinden gerçek veri topla
                var turkeyRegions = new[]
                {
                    new { Name = "İstanbul", Lat = 41.0082, Lon = 28.9784 },
                    new { Name = "Ankara", Lat = 39.9334, Lon = 32.8597 },
                    new { Name = "İzmir", Lat = 38.4237, Lon = 27.1428 },
                    new { Name = "Antalya", Lat = 36.8969, Lon = 30.7133 },
                    new { Name = "Konya", Lat = 37.8667, Lon = 32.4833 }
                };

                var productionData = new List<object>();

                foreach (var region in turkeyRegions)
                {
                    try
                    {
                        // NASA POWER API'den güneş ışınım verisi
                        var nasaUrl = $"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,WS2M,T2M&community=RE&longitude={region.Lon}&latitude={region.Lat}&start=20250101&end=20250101&format=JSON";
                        var nasaResponse = await _httpClient.GetAsync(nasaUrl);
                        
                        if (nasaResponse.IsSuccessStatusCode)
                        {
                            var content = await nasaResponse.Content.ReadAsStringAsync();
                            var nasaData = JsonSerializer.Deserialize<object>(content);
                            
                            productionData.Add(new
                            {
                                region = region.Name,
                                coordinates = new { lat = region.Lat, lon = region.Lon },
                                data = nasaData,
                                source = "NASA POWER API"
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, $"{region.Name} bölgesi için veri alınamadı");
                    }
                }

                if (productionData.Any())
                {
                    return Ok(new
                    {
                        timestamp = DateTime.UtcNow,
                        country = "Türkiye",
                        regions = productionData,
                        totalRegions = productionData.Count,
                        source = "NASA POWER API - Gerçek Veri"
                    });
                }

                return StatusCode(500, new { message = "Türkiye için gerçek veri alınamadı", error = "Tüm API'ler başarısız" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Gerçek zamanlı üretim API hatası");
                return StatusCode(500, new { message = "Gerçek zamanlı üretim verisi alınırken hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("wind-power-plants")]
        public async Task<ActionResult> GetWindPowerPlants()
        {
            try
            {
                // Türkiye'nin önemli rüzgar bölgeleri
                var windRegions = new[]
                {
                    new { Name = "Bandırma", Lat = 40.3500, Lon = 27.9700 },
                    new { Name = "Çanakkale", Lat = 40.1553, Lon = 26.4142 },
                    new { Name = "Soma", Lat = 39.1889, Lon = 27.6053 },
                    new { Name = "İzmir", Lat = 38.4237, Lon = 27.1428 }
                };

                var windData = new List<object>();

                foreach (var region in windRegions)
                {
                    try
                    {
                        // NASA POWER API'den rüzgar verisi
                        var nasaUrl = $"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=WS2M,WS10M&community=RE&longitude={region.Lon}&latitude={region.Lat}&start=20250101&end=20250101&format=JSON";
                        var nasaResponse = await _httpClient.GetAsync(nasaUrl);
                        
                        if (nasaResponse.IsSuccessStatusCode)
                        {
                            var content = await nasaResponse.Content.ReadAsStringAsync();
                            var nasaData = JsonSerializer.Deserialize<object>(content);
                            
                            windData.Add(new
                            {
                                region = region.Name,
                                coordinates = new { lat = region.Lat, lon = region.Lon },
                                windData = nasaData,
                                source = "NASA POWER API"
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, $"{region.Name} rüzgar verisi alınamadı");
                    }
                }

                if (windData.Any())
                {
                    return Ok(new
                    {
                        timestamp = DateTime.UtcNow,
                        country = "Türkiye",
                        windRegions = windData,
                        totalRegions = windData.Count,
                        source = "NASA POWER API - Gerçek Rüzgar Verisi"
                    });
                }

                return StatusCode(500, new { message = "Rüzgar santralleri verisi alınamıyor", error = "API'ler başarısız" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Rüzgar santralleri API hatası");
                return StatusCode(500, new { message = "Rüzgar santralleri verisi alınırken hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("solar-power-plants")]
        public async Task<ActionResult> GetSolarPowerPlants()
        {
            try
            {
                // Türkiye'nin önemli güneş bölgeleri
                var solarRegions = new[]
                {
                    new { Name = "Konya", Lat = 37.8667, Lon = 32.4833 },
                    new { Name = "Antalya", Lat = 36.8969, Lon = 30.7133 },
                    new { Name = "Mersin", Lat = 36.8000, Lon = 34.6333 },
                    new { Name = "Şanlıurfa", Lat = 37.1591, Lon = 38.7969 }
                };

                var solarData = new List<object>();

                foreach (var region in solarRegions)
                {
                    try
                    {
                        // NASA POWER API'den güneş ışınım verisi
                        var nasaUrl = $"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,CLRSKY_SFC_SW_DWN,T2M&community=RE&longitude={region.Lon}&latitude={region.Lat}&start=20250101&end=20250101&format=JSON";
                        var nasaResponse = await _httpClient.GetAsync(nasaUrl);
                        
                        if (nasaResponse.IsSuccessStatusCode)
                        {
                            var content = await nasaResponse.Content.ReadAsStringAsync();
                            var nasaData = JsonSerializer.Deserialize<object>(content);
                            
                            solarData.Add(new
                            {
                                region = region.Name,
                                coordinates = new { lat = region.Lat, lon = region.Lon },
                                solarData = nasaData,
                                source = "NASA POWER API"
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, $"{region.Name} güneş verisi alınamadı");
                    }
                }

                if (solarData.Any())
                {
                    return Ok(new
                    {
                        timestamp = DateTime.UtcNow,
                        country = "Türkiye",
                        solarRegions = solarData,
                        totalRegions = solarData.Count,
                        source = "NASA POWER API - Gerçek Güneş Verisi"
                    });
                }

                return StatusCode(500, new { message = "Güneş santralleri verisi alınamıyor", error = "API'ler başarısız" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Güneş santralleri API hatası");
                return StatusCode(500, new { message = "Güneş santralleri verisi alınırken hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("plant/{plantId}/production")]
        public async Task<ActionResult> GetPlantProduction(int plantId)
        {
            try
            {
                // Santral ID'sine göre Türkiye'deki farklı bölgeler
                var plantLocations = new Dictionary<int, (string Name, double Lat, double Lon)>
                {
                    { 1, ("Soma Rüzgar Santrali", 39.1889, 27.6053) },
                    { 2, ("Bandırma Rüzgar Santrali", 40.3500, 27.9700) },
                    { 3, ("Çanakkale Rüzgar Santrali", 40.1553, 26.4142) },
                    { 101, ("Konya Güneş Santrali", 37.8667, 32.4833) },
                    { 102, ("Antalya Güneş Santrali", 36.8969, 30.7133) },
                    { 103, ("Mersin Güneş Santrali", 36.8000, 34.6333) }
                };

                if (plantLocations.TryGetValue(plantId, out var location))
                {
                    try
                    {
                        // NASA POWER API'den santral verisi
                        var nasaUrl = $"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,WS2M,T2M&community=RE&longitude={location.Lon}&latitude={location.Lat}&start=20250101&end=20250101&format=JSON";
                        var nasaResponse = await _httpClient.GetAsync(nasaUrl);
                        
                        if (nasaResponse.IsSuccessStatusCode)
                        {
                            var content = await nasaResponse.Content.ReadAsStringAsync();
                            var nasaData = JsonSerializer.Deserialize<object>(content);
                            
                            return Ok(new
                            {
                                plantId = plantId,
                                plantName = location.Name,
                                coordinates = new { lat = location.Lat, lon = location.Lon },
                                productionData = nasaData,
                                timestamp = DateTime.UtcNow,
                                source = "NASA POWER API - Gerçek Santral Verisi"
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, $"Santral {plantId} verisi alınamadı");
                    }
                }

                return StatusCode(500, new { message = "Santral üretim verisi alınamıyor", error = "Veri kaynağı bulunamadı" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Santral üretim API hatası");
                return StatusCode(500, new { message = "Santral üretim verisi alınırken hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("regional-production")]
        public async Task<ActionResult> GetRegionalProduction([FromQuery] string region)
        {
            try
            {
                // Türkiye bölgeleri
                var turkeyRegions = new Dictionary<string, (double Lat, double Lon)>
                {
                    { "istanbul", (41.0082, 28.9784) },
                    { "ankara", (39.9334, 32.8597) },
                    { "izmir", (38.4237, 27.1428) },
                    { "antalya", (36.8969, 30.7133) },
                    { "konya", (37.8667, 32.4833) },
                    { "mersin", (36.8000, 34.6333) },
                    { "samsun", (41.2867, 36.3300) },
                    { "bursa", (40.1885, 29.0610) }
                };

                if (turkeyRegions.TryGetValue(region.ToLower(), out var coordinates))
                {
                    try
                    {
                        // NASA POWER API'den bölgesel veri
                        var nasaUrl = $"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN,WS2M,T2M&community=RE&longitude={coordinates.Lon}&latitude={coordinates.Lat}&start=20250101&end=20250101&format=JSON";
                        var nasaResponse = await _httpClient.GetAsync(nasaUrl);
                        
                        if (nasaResponse.IsSuccessStatusCode)
                        {
                            var content = await nasaResponse.Content.ReadAsStringAsync();
                            var nasaData = JsonSerializer.Deserialize<object>(content);
                            
                            return Ok(new
                            {
                                region = region,
                                coordinates = new { lat = coordinates.Lat, lon = coordinates.Lon },
                                regionalData = nasaData,
                                timestamp = DateTime.UtcNow,
                                source = "NASA POWER API - Gerçek Bölgesel Veri"
                            });
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, $"{region} bölgesi verisi alınamadı");
                    }
                }

                return StatusCode(500, new { message = "Bölgesel üretim verisi alınamıyor", error = "Veri kaynağı bulunamadı" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Bölgesel üretim API hatası");
                return StatusCode(500, new { message = "Bölgesel üretim verisi alınırken hata oluştu", error = ex.Message });
            }
        }
    }
} 