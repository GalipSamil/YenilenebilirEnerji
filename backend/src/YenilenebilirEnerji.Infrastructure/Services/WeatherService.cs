using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using YenilenebilirEnerji.Application.Interfaces;
using YenilenebilirEnerji.Domain.Models;

namespace YenilenebilirEnerji.Infrastructure.Services
{
    public class WeatherService : IWeatherService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public WeatherService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["WeatherApi:Key"];
        }

        public async Task<WeatherData> GetWeatherDataAsync(double latitude, double longitude)
        {
            try
            {
                var url = $"http://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={_apiKey}&units=metric";
                var response = await _httpClient.GetStringAsync(url);
                
                // Debug için response'u logla
                Console.WriteLine($"OpenWeather Response: {response.Substring(0, Math.Min(200, response.Length))}...");
                
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var data = JsonSerializer.Deserialize<OpenWeatherResponse>(response, options);

                if (data?.Main == null)
                {
                    Console.WriteLine("OpenWeather Main data is null!");
                    throw new Exception("Invalid OpenWeather response structure");
                }

                return new WeatherData
                {
                    Temperature = data.Main.Temp,
                    WindSpeed = data.Wind?.Speed ?? 0,
                    SolarRadiation = CalculateSolarRadiation(data.Clouds?.All ?? 0, latitude, longitude),
                    Humidity = data.Main.Humidity,
                    Pressure = data.Main.Pressure,
                    WeatherCondition = data.Weather?[0]?.Main ?? "Clear",
                    Timestamp = DateTime.UtcNow
                };
            }
            catch (Exception ex)
            {
                // Debug için log ekle
                Console.WriteLine($"WeatherService Error: {ex.Message}");
                Console.WriteLine($"API URL: http://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={_apiKey}&units=metric");
                
                // Hata durumunda varsayılan değerler
                return new WeatherData
                {
                    Temperature = 25,
                    WindSpeed = 5,
                    SolarRadiation = 800,
                    Humidity = 50,
                    Pressure = 1013.25,
                    WeatherCondition = "Clear",
                    Timestamp = DateTime.UtcNow
                };
            }
        }

        public double CalculateSolarEfficiency(WeatherData weatherData)
        {
            var baseEfficiency = 0.15; // %15 baz verimlilik
            var temperatureEffect = Math.Max(0, 1 - (Math.Max(0, weatherData.Temperature - 25) * 0.005));
            var radiationEffect = Math.Min(1, weatherData.SolarRadiation / 1000);

            return baseEfficiency * temperatureEffect * radiationEffect;
        }

        public double CalculateWindEfficiency(WeatherData weatherData)
        {
            // Rüzgar türbini verimlilik hesaplaması
            // Tipik bir rüzgar türbini 3-25 m/s arasında çalışır
            // 3 m/s altında durur, 25 m/s üstünde güvenlik için durur
            
            if (weatherData.WindSpeed < 3) return 0;
            if (weatherData.WindSpeed > 25) return 0;

            // Basit bir verimlilik eğrisi
            // 3-12 m/s arası lineer artış
            // 12-25 m/s arası sabit maksimum verimlilik
            if (weatherData.WindSpeed <= 12)
            {
                return (weatherData.WindSpeed - 3) / 9.0; // 0-1 arası değer
            }
            
            return 1.0; // Maksimum verimlilik
        }

        private double CalculateSolarRadiation(int cloudCover, double latitude, double longitude)
        {
            // Basit bir güneş radyasyonu hesaplaması
            // Gerçek dünyada çok daha karmaşık faktörler var
            
            var maxRadiation = 1000; // W/m²
            var cloudEffect = (100 - cloudCover) / 100.0;
            
            // Enlem bazlı basit bir düzeltme
            var latitudeEffect = Math.Cos(Math.Abs(latitude) * Math.PI / 180);
            
            return maxRadiation * cloudEffect * latitudeEffect;
        }

        private class OpenWeatherResponse
        {
            public MainData Main { get; set; }
            public WindData Wind { get; set; }
            public CloudData Clouds { get; set; }
            public WeatherData[] Weather { get; set; }

            public class MainData
            {
                public double Temp { get; set; }
                public double Humidity { get; set; }
                public double Pressure { get; set; }
            }

            public class WindData
            {
                public double Speed { get; set; }
            }

            public class CloudData
            {
                public int All { get; set; }
            }

            public class WeatherData
            {
                public string Main { get; set; }
            }
        }
    }
} 