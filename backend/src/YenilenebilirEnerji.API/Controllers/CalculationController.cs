using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using YenilenebilirEnerji.Infrastructure.Data;
using YenilenebilirEnerji.Domain.Models;
using YenilenebilirEnerji.Domain.Entities;
using YenilenebilirEnerji.Application.Interfaces;

namespace YenilenebilirEnerji.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CalculationController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<CalculationController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly IWeatherService _weatherService;

        public CalculationController(IHttpClientFactory httpClientFactory, ILogger<CalculationController> logger, ApplicationDbContext context, IWeatherService weatherService)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _context = context;
            _weatherService = weatherService;
        }

        [HttpGet("solar-production")]
        public async Task<ActionResult> CalculateSolarProduction()
        {
            try
            {
                var solarPlants = await _context.EnergyPlants
                    .Where(p => p.Type == PlantType.Solar)
                    .ToListAsync();

                var results = new List<object>();
                var totalProduction = 0.0;

                foreach (var plant in solarPlants)
                {
                    // Hava durumu verilerine göre dinamik verimlilik hesapla
                    var weatherData = await _weatherService.GetWeatherDataAsync(plant.Latitude, plant.Longitude);
                    var baseEfficiency = 0.85;
                    
                    // Sıcaklık etkisi: 25°C optimal, her 5°C sapma için %5 verimlilik kaybı
                    var temperatureEffect = Math.Max(0.5, 1 - Math.Abs(weatherData.Temperature - 25) * 0.01);
                    
                    // Güneş radyasyonu etkisi: 800 W/m² optimal
                    var radiationEffect = Math.Min(1.2, weatherData.SolarRadiation / 800.0);
                    
                    // Hava durumu etkisi
                    var weatherEffect = 1.0;
                    if (weatherData.WeatherCondition.Contains("Rain") || weatherData.WeatherCondition.Contains("Storm"))
                        weatherEffect = 0.3;
                    else if (weatherData.WeatherCondition.Contains("Cloud"))
                        weatherEffect = 0.7;
                    
                    var efficiency = baseEfficiency * temperatureEffect * radiationEffect * weatherEffect;
                    var production = plant.Capacity * efficiency;
                    
                    // Dinamik fiyat: Hava durumuna göre elektrik talebi değişir
                    var basePricePerKwh = 2.5; // TL/kWh
                    var dynamicPrice = weatherData.Temperature > 30 ? basePricePerKwh * 1.3 : // Sıcakta klima talebi
                                     weatherData.Temperature < 5 ? basePricePerKwh * 1.2 :   // Soğukta ısıtma talebi
                                     basePricePerKwh;
                    
                    var dailyRevenue = production * 1000 * dynamicPrice;
                    var monthlyRevenue = dailyRevenue * 30;
                    totalProduction += production;

                    results.Add(new
                    {
                        region = plant.Name,
                        plantCapacity = $"{plant.Capacity} MW",
                        dailyProduction = $"{production:F1} MWh",
                        monthlyProduction = $"{production * 30:F0} MWh",
                        dailyRevenue = $"{dailyRevenue:F0} TL",
                        monthlyRevenue = $"{monthlyRevenue:F0} TL",
                        efficiency = Math.Round(efficiency * 100, 1),
                        sunHours = 8.5,
                        panelCount = $"{plant.Capacity * 1000 / 0.4:F0}",
                        coordinates = new[] { plant.Latitude, plant.Longitude },
                        solarIrradiance = Math.Round(weatherData.SolarRadiation, 1),
                        temperature = Math.Round(weatherData.Temperature, 1),
                        weatherCondition = weatherData.WeatherCondition
                    });
                }

                return Ok(new { 
                    results = results,
                    totalProduction = Math.Round(totalProduction, 2),
                    unit = "MWh",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Güneş enerjisi üretimi hesaplanırken hata oluştu");
                return StatusCode(500, new { message = "Hesaplama yapılırken bir hata oluştu", error = ex.Message });
            }
        }

        private double CalculateEfficiency(double temperature, double solarRadiation)
        {
            var baseEfficiency = 0.15;
            var temperatureEffect = Math.Max(0, 1 - (Math.Max(0, temperature - 25) * 0.005));
            var radiationEffect = Math.Min(1, solarRadiation / 1000);

            return baseEfficiency * temperatureEffect * radiationEffect;
        }

        [HttpGet("wind-production")]
        public async Task<ActionResult> CalculateWindProduction()
        {
            try
            {
                var windPlants = await _context.EnergyPlants
                    .Where(p => p.Type == PlantType.Wind)
                    .ToListAsync();

                var results = new List<object>();
                var totalProduction = 0.0;

                foreach (var plant in windPlants)
                {
                    // Hava durumu verilerine göre dinamik verimlilik hesapla
                    var weatherData = await _weatherService.GetWeatherDataAsync(plant.Latitude, plant.Longitude);
                    var baseEfficiency = 0.75;
                    
                    // Rüzgar hızı etkisi: Daha hassas hesaplama
                    var windEffect = 1.0;
                    if (weatherData.WindSpeed < 3) 
                        windEffect = 0.1; // Çok az rüzgar
                    else if (weatherData.WindSpeed < 7) 
                        windEffect = 0.3 + (weatherData.WindSpeed - 3) * 0.1; // 3-7 m/s: 0.3-0.7 arası
                    else if (weatherData.WindSpeed < 12) 
                        windEffect = 0.7 + (weatherData.WindSpeed - 7) * 0.06; // 7-12 m/s: 0.7-1.0 arası
                    else if (weatherData.WindSpeed <= 15) 
                        windEffect = 1.0; // Optimal
                    else if (weatherData.WindSpeed <= 25) 
                        windEffect = 1.0 - (weatherData.WindSpeed - 15) * 0.02; // 15-25 m/s: 1.0-0.8 arası
                    else 
                        windEffect = 0.2; // Çok kuvvetli rüzgar, güvenlik nedeniyle durma
                    
                    var efficiency = baseEfficiency * windEffect;
                    var production = plant.Capacity * efficiency;
                    
                    // Debug log
                    _logger.LogInformation($"Plant: {plant.Name}, WindSpeed: {weatherData.WindSpeed:F1}, WindEffect: {windEffect:F2}, Efficiency: {efficiency:F3}");
                    
                    // Dinamik fiyat: Rüzgarlı havalarda daha yüksek üretim, fiyat düşer
                    var basePricePerKwh = 2.5; // TL/kWh
                    var dynamicPrice = weatherData.WindSpeed > 15 ? basePricePerKwh * 0.9 : // Çok rüzgarlı, arz fazla
                                     weatherData.WindSpeed < 7 ? basePricePerKwh * 1.1 :    // Az rüzgar, arz az
                                     basePricePerKwh;
                    
                    var dailyRevenue = production * 1000 * dynamicPrice;
                    var monthlyRevenue = dailyRevenue * 30;
                    totalProduction += production;

                    results.Add(new
                    {
                        region = plant.Name,
                        turbineCapacity = $"{plant.Capacity} MW",
                        dailyProduction = $"{production:F1} MWh",
                        monthlyProduction = $"{production * 30:F0} MWh",
                        dailyRevenue = $"{dailyRevenue:F0} TL",
                        monthlyRevenue = $"{monthlyRevenue:F0} TL",
                        efficiency = Math.Round(efficiency * 100, 1),
                        windSpeed = Math.Round(weatherData.WindSpeed, 1),
                        turbineCount = $"{plant.Capacity * 2:F0}",
                        coordinates = new[] { plant.Latitude, plant.Longitude },
                        temperature = Math.Round(weatherData.Temperature, 1),
                        weatherCondition = weatherData.WeatherCondition
                    });
                }

                return Ok(new { 
                    results = results,
                    totalProduction = Math.Round(totalProduction, 2),
                    unit = "MWh",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Rüzgar enerjisi üretimi hesaplanırken hata oluştu");
                return StatusCode(500, new { message = "Hesaplama yapılırken bir hata oluştu", error = ex.Message });
            }
        }

        private double CalculateWindEfficiency(double windSpeed)
        {
            if (windSpeed < 3) return 0;
            if (windSpeed > 25) return 0;
            
            var efficiency = 0.0;
            if (windSpeed >= 3 && windSpeed <= 12)
            {
                efficiency = (windSpeed - 3) / 9 * 0.4; // 0-40% arası
            }
            else if (windSpeed > 12 && windSpeed <= 25)
            {
                efficiency = 0.4; // Sabit %40
            }
            
            return efficiency;
        }

        [HttpGet("geothermal-production")]
        public async Task<ActionResult> CalculateGeothermalProduction()
        {
            try
            {
                var geothermalPlants = await _context.EnergyPlants
                    .Where(p => p.Type == PlantType.Geothermal)
                    .ToListAsync();

                var results = new List<object>();
                var totalProduction = 0.0;

                foreach (var plant in geothermalPlants)
                {
                    // Jeotermal rezervuar sıcaklıkları (gerçekçi değerler)
                    var temperatures = new Dictionary<string, double>
                    {
                        { "Denizli JES", 180 },
                        { "Aydın JES", 165 },
                        { "Manisa JES", 155 },
                        { "Çanakkale JES", 160 }
                    };

                    var reservoirTemp = temperatures.ContainsKey(plant.Name) ? temperatures[plant.Name] : 170;
                    _logger.LogInformation($"Plant: {plant.Name}, Found in dict: {temperatures.ContainsKey(plant.Name)}, ReservoirTemp: {reservoirTemp}");
                    
                    // Hava durumu etkisi: Dış sıcaklık soğutma ihtiyacını etkiler
                    var weatherData = await _weatherService.GetWeatherDataAsync(plant.Latitude, plant.Longitude);
                    var baseEfficiency = 0.85;
                    
                    // Rezervuar sıcaklığı etkisi: Daha sıcak rezervuar = daha yüksek verimlilik
                    var tempEffect = Math.Min(1.2, reservoirTemp / 150.0);
                    
                    // Dış hava sıcaklığı etkisi: Soğuk hava = daha iyi soğutma = daha yüksek verimlilik
                    var ambientTempEffect = Math.Max(0.9, 1.1 - (weatherData.Temperature / 40.0));
                    
                    var efficiency = baseEfficiency * tempEffect * ambientTempEffect;
                    var production = plant.Capacity * efficiency;
                    
                    // Debug log
                    _logger.LogInformation($"Plant: {plant.Name}, ReservoirTemp: {reservoirTemp:F1}, AmbientTemp: {weatherData.Temperature:F1}, TempEffect: {tempEffect:F3}, AmbientEffect: {ambientTempEffect:F3}, Efficiency: {efficiency:F3}");
                    totalProduction += production;

                    // Dinamik fiyat: Kış aylarında ısıtma talebi yüksek
                    var basePricePerKwh = 2.5; // TL/kWh
                    var dynamicPrice = weatherData.Temperature < 10 ? basePricePerKwh * 1.2 : // Soğukta ısıtma talebi
                                     weatherData.Temperature > 35 ? basePricePerKwh * 1.1 : // Sıcakta soğutma talebi
                                     basePricePerKwh;
                    
                    var dailyRevenue = production * 1000 * dynamicPrice;
                    var monthlyRevenue = dailyRevenue * 30;

                    results.Add(new
                    {
                        region = plant.Name,
                        plantCapacity = $"{plant.Capacity} MW",
                        dailyProduction = $"{production:F1} MWh",
                        monthlyProduction = $"{production * 30:F0} MWh",
                        dailyRevenue = $"{dailyRevenue:F0} TL",
                        monthlyRevenue = $"{monthlyRevenue:F0} TL",
                        efficiency = Math.Round(efficiency * 100, 1),
                        reservoirTemperature = reservoirTemp,
                        ambientTemperature = weatherData.Temperature,
                        humidity = weatherData.Humidity,
                        pressure = weatherData.Pressure,
                        depth = $"{2000 + new Random().Next(500, 1000)}m",
                        coordinates = new[] { plant.Latitude, plant.Longitude }
                    });
                }

                return Ok(new { 
                    results = results,
                    totalProduction = Math.Round(totalProduction, 2),
                    unit = "MWh",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Jeotermal enerji üretimi hesaplanırken hata oluştu");
                return StatusCode(500, new { message = "Hesaplama yapılırken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("plant/{id}")]
        public async Task<ActionResult<object>> GetPlantDetails(int id)
        {
            try
            {
                var plant = await _context.EnergyPlants.FindAsync(id);
                if (plant == null)
                {
                    return NotFound(new { message = "Plant not found" });
                }

                // Get weather data for the plant location
                var weatherData = await _weatherService.GetWeatherDataAsync(plant.Latitude, plant.Longitude);

                // Generate mock production data based on plant type and current conditions
                var hourlyProduction = GenerateHourlyProductionData(plant, weatherData);
                var dailyProduction = GenerateDailyProductionData(plant, weatherData);
                var monthlyProduction = GenerateMonthlyProductionData(plant);

                // Calculate efficiency and performance metrics
                var efficiency = CalculateEfficiency(plant, weatherData);
                var performanceRatio = CalculatePerformanceRatio(plant, hourlyProduction);

                return Ok(new
                {
                    plant = new
                    {
                        id = plant.Id,
                        name = plant.Name,
                        type = plant.Type.ToString(),
                        latitude = plant.Latitude,
                        longitude = plant.Longitude,
                        capacity = plant.Capacity,
                        status = plant.Status,
                        lastUpdated = plant.LastUpdated
                    },
                    weather = new
                    {
                        temperature = weatherData.Temperature,
                        windSpeed = weatherData.WindSpeed,
                        solarRadiation = weatherData.SolarRadiation,
                        weatherCondition = weatherData.WeatherCondition
                    },
                    production = new
                    {
                        current = (hourlyProduction.LastOrDefault() as dynamic)?.production ?? 0,
                        hourly = hourlyProduction,
                        daily = dailyProduction,
                        monthly = monthlyProduction
                    },
                    performance = new
                    {
                        efficiency = efficiency,
                        performanceRatio = performanceRatio,
                        availabilityFactor = CalculateAvailabilityFactor(plant),
                        capacityFactor = CalculateCapacityFactor(plant, dailyProduction)
                    },
                    technicalSpecs = GetTechnicalSpecs(plant)
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting plant details for plant ID: {PlantId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        private List<object> GenerateHourlyProductionData(EnergyPlant plant, WeatherData weather)
        {
            var data = new List<object>();
            var random = new Random();
            var baseProduction = plant.Capacity * 0.6; // Base production at 60% capacity

            for (int hour = 0; hour < 24; hour++)
            {
                double production = 0;
                
                switch (plant.Type)
                {
                    case PlantType.Solar:
                        // Solar production peaks at midday
                        var solarMultiplier = Math.Max(0, Math.Sin((hour - 6) * Math.PI / 12));
                        production = baseProduction * solarMultiplier * (weather.Temperature > 10 ? 1.0 : 0.7);
                        break;
                        
                    case PlantType.Wind:
                        // Wind production varies with wind speed
                        var windMultiplier = Math.Min(1.0, weather.WindSpeed / 15.0);
                        production = baseProduction * windMultiplier * (0.8 + random.NextDouble() * 0.4);
                        break;
                        
                    case PlantType.Geothermal:
                        // Geothermal is steady 24/7
                        production = baseProduction * (0.85 + random.NextDouble() * 0.15);
                        break;
                }

                data.Add(new
                {
                    hour = hour,
                    production = Math.Round(production, 2),
                    timestamp = DateTime.Now.Date.AddHours(hour)
                });
            }

            return data;
        }

        private List<object> GenerateDailyProductionData(EnergyPlant plant, WeatherData weather)
        {
            var data = new List<object>();
            var random = new Random();
            var baseProduction = plant.Capacity * 12; // 12 hours equivalent daily production

            for (int day = 0; day < 30; day++)
            {
                double dailyVariation = 0.8 + random.NextDouble() * 0.4;
                double production = baseProduction * dailyVariation;

                data.Add(new
                {
                    day = day + 1,
                    date = DateTime.Now.Date.AddDays(-29 + day),
                    production = Math.Round(production, 2)
                });
            }

            return data;
        }

        private List<object> GenerateMonthlyProductionData(EnergyPlant plant)
        {
            var data = new List<object>();
            var random = new Random();
            var baseProduction = plant.Capacity * 365; // Annual production estimate

            var months = new[] { "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
                               "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };

            for (int month = 0; month < 12; month++)
            {
                double seasonalMultiplier = 1.0;
                
                switch (plant.Type)
                {
                    case PlantType.Solar:
                        // Solar peaks in summer
                        seasonalMultiplier = 0.6 + 0.4 * Math.Sin((month - 2) * Math.PI / 6);
                        break;
                    case PlantType.Wind:
                        // Wind is stronger in winter
                        seasonalMultiplier = 1.2 - 0.4 * Math.Sin((month - 2) * Math.PI / 6);
                        break;
                    case PlantType.Geothermal:
                        // Geothermal is steady year-round
                        seasonalMultiplier = 0.95 + random.NextDouble() * 0.1;
                        break;
                }

                double monthlyProduction = (baseProduction / 12) * seasonalMultiplier;

                data.Add(new
                {
                    month = months[month],
                    monthNumber = month + 1,
                    production = Math.Round(monthlyProduction, 2)
                });
            }

            return data;
        }

        private double CalculateEfficiency(EnergyPlant plant, WeatherData weather)
        {
            var random = new Random();
            double baseEfficiency = 0.85;

            switch (plant.Type)
            {
                case PlantType.Solar:
                    // Solar efficiency decreases with high temperature
                    return Math.Max(0.7, baseEfficiency - (weather.Temperature - 25) * 0.004);
                case PlantType.Wind:
                    // Wind efficiency depends on wind speed
                    return Math.Min(0.95, baseEfficiency + (weather.WindSpeed - 10) * 0.01);
                case PlantType.Geothermal:
                    // Geothermal has steady efficiency
                    return 0.87 + random.NextDouble() * 0.06;
                default:
                    return baseEfficiency;
            }
        }

        private double CalculatePerformanceRatio(EnergyPlant plant, List<object> hourlyData)
        {
            // Performance ratio is actual vs theoretical production
            var random = new Random();
            return 0.75 + random.NextDouble() * 0.2; // 75-95%
        }

        private double CalculateAvailabilityFactor(EnergyPlant plant)
        {
            var random = new Random();
            return 0.92 + random.NextDouble() * 0.07; // 92-99%
        }

        private double CalculateCapacityFactor(EnergyPlant plant, List<object> dailyData)
        {
            switch (plant.Type)
            {
                case PlantType.Solar:
                    return 0.20 + new Random().NextDouble() * 0.15; // 20-35%
                case PlantType.Wind:
                    return 0.25 + new Random().NextDouble() * 0.20; // 25-45%
                case PlantType.Geothermal:
                    return 0.80 + new Random().NextDouble() * 0.15; // 80-95%
                default:
                    return 0.30;
            }
        }

        private object GetTechnicalSpecs(EnergyPlant plant)
        {
            switch (plant.Type)
            {
                case PlantType.Solar:
                    return new
                    {
                        panelType = "Monokristal Silikon",
                        inverterType = "String Inverter",
                        trackingSystem = "Tek Eksen Takip",
                        moduleEfficiency = "21.2%",
                        systemVoltage = "1500V DC",
                        gridConnection = "154 kV"
                    };
                    
                case PlantType.Wind:
                    return new
                    {
                        turbineModel = "Vestas V150-4.2MW",
                        hubHeight = "105m",
                        rotorDiameter = "150m",
                        cutInSpeed = "3 m/s",
                        cutOutSpeed = "25 m/s",
                        gridConnection = "154 kV"
                    };
                    
                case PlantType.Geothermal:
                    return new
                    {
                        fluidTemperature = "165°C",
                        wellDepth = "2500m",
                        steamPressure = "8.5 bar",
                        turbineType = "Çift Basınçlı",
                        coolingSystem = "Hava Soğutmalı",
                        gridConnection = "154 kV"
                    };
                    
                default:
                    return new { };
            }
        }
    }
} 