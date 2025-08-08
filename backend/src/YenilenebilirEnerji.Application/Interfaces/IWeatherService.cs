using System.Threading.Tasks;
using YenilenebilirEnerji.Domain.Models;

namespace YenilenebilirEnerji.Application.Interfaces
{
    public interface IWeatherService
    {
        Task<WeatherData> GetWeatherDataAsync(double latitude, double longitude);
        double CalculateSolarEfficiency(WeatherData weatherData);
        double CalculateWindEfficiency(WeatherData weatherData);
    }
} 