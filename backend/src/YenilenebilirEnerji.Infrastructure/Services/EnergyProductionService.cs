using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using YenilenebilirEnerji.Application.Interfaces;
using YenilenebilirEnerji.Domain.Entities;
using YenilenebilirEnerji.Domain.Models;
using YenilenebilirEnerji.Infrastructure.Data;

namespace YenilenebilirEnerji.Infrastructure.Services
{
    public class EnergyProductionService : IEnergyProductionService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWeatherService _weatherService;

        public EnergyProductionService(ApplicationDbContext context, IWeatherService weatherService)
        {
            _context = context;
            _weatherService = weatherService;
        }

        public async Task<List<EnergyPlant>> GetAllPlantsAsync()
        {
            return await _context.EnergyPlants.ToListAsync();
        }

        public async Task<EnergyPlant> GetPlantByIdAsync(int id)
        {
            var plant = await _context.EnergyPlants.FindAsync(id);
            if (plant == null)
                throw new KeyNotFoundException($"Plant with ID {id} not found");
            return plant;
        }

        public async Task<List<EnergyPlant>> GetPlantsByTypeAsync(PlantType type)
        {
            return await _context.EnergyPlants
                .Where(p => p.Type == type)
                .ToListAsync();
        }

        public async Task<ProductionData> GetProductionDataAsync(int plantId)
        {
            var plant = await GetPlantByIdAsync(plantId);
            var weatherData = await _weatherService.GetWeatherDataAsync(plant.Latitude, plant.Longitude);

            var efficiency = plant.Type switch
            {
                PlantType.Solar => _weatherService.CalculateSolarEfficiency(weatherData),
                PlantType.Wind => _weatherService.CalculateWindEfficiency(weatherData),
                _ => 0.8 // Diğer tipler için sabit verimlilik
            };

            var currentProduction = plant.Capacity * efficiency;

            return new ProductionData
            {
                PlantId = plantId,
                Timestamp = DateTime.UtcNow,
                CurrentProduction = currentProduction,
                Efficiency = efficiency,
                WeatherCondition = weatherData.WeatherCondition,
                Temperature = weatherData.Temperature,
                WindSpeed = weatherData.WindSpeed,
                SolarRadiation = weatherData.SolarRadiation,
                ProductionByType = new Dictionary<string, double>
                {
                    { plant.Type.ToString(), currentProduction }
                },
                HourlyData = new List<HourlyProductionData>
                {
                    new HourlyProductionData
                    {
                        Hour = DateTime.UtcNow,
                        Production = currentProduction,
                        Efficiency = efficiency
                    }
                },
                PlantType = plant.Type
            };
        }

        public async Task<List<ProductionData>> GetProductionHistoryAsync(int plantId, DateTime startDate, DateTime endDate)
        {
            return await _context.ProductionData
                .Where(p => p.PlantId == plantId && p.Timestamp >= startDate && p.Timestamp <= endDate)
                .OrderBy(p => p.Timestamp)
                .ToListAsync();
        }

        public async Task<double> CalculateTotalProductionAsync(PlantType? type = null)
        {
            var plants = type.HasValue
                ? await GetPlantsByTypeAsync(type.Value)
                : await GetAllPlantsAsync();

            double totalProduction = 0;
            foreach (var plant in plants)
            {
                var productionData = await GetProductionDataAsync(plant.Id);
                totalProduction += productionData.CurrentProduction;
            }

            return totalProduction;
        }

        public async Task<Dictionary<string, double>> GetProductionByTypeAsync()
        {
            var result = new Dictionary<string, double>();
            foreach (PlantType type in Enum.GetValues(typeof(PlantType)))
            {
                var production = await CalculateTotalProductionAsync(type);
                result[type.ToString()] = production;
            }
            return result;
        }

        public async Task UpdatePlantStatusAsync(int plantId, string status)
        {
            var plant = await GetPlantByIdAsync(plantId);
            plant.Status = status;
            plant.LastUpdated = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task<EnergyPlant> CreatePlantAsync(object request)
        {
            // Cast the request to the proper type
            dynamic req = request;
            
            var plant = new EnergyPlant
            {
                Name = req.Name,
                Type = req.Type,
                Capacity = req.Capacity,
                Latitude = req.Latitude,
                Longitude = req.Longitude,
                Status = "active",
                LastUpdated = DateTime.UtcNow
            };

            _context.EnergyPlants.Add(plant);
            await _context.SaveChangesAsync();
            
            return plant;
        }

        public async Task<List<EnergyPlant>> GetNearbyPlantsAsync(double latitude, double longitude, double radiusKm)
        {
            var allPlants = await GetAllPlantsAsync();
            
            var nearbyPlants = allPlants.Where(plant => 
            {
                var distance = CalculateDistance(latitude, longitude, plant.Latitude, plant.Longitude);
                return distance <= radiusKm;
            }).OrderBy(plant => CalculateDistance(latitude, longitude, plant.Latitude, plant.Longitude))
            .ToList();
            
            return nearbyPlants;
        }
        
        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            // Haversine formula - İki nokta arası mesafe hesaplama
            var R = 6371; // Dünya yarıçapı (km)
            var dLat = (lat2 - lat1) * Math.PI / 180;
            var dLon = (lon2 - lon1) * Math.PI / 180;
            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }
    }
} 