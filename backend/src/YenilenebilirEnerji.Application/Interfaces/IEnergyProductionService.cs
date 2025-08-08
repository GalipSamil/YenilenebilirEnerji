using YenilenebilirEnerji.Domain.Entities;

namespace YenilenebilirEnerji.Application.Interfaces
{
    public interface IEnergyProductionService
    {
        Task<List<EnergyPlant>> GetAllPlantsAsync();
        Task<EnergyPlant> GetPlantByIdAsync(int id);
        Task<List<EnergyPlant>> GetPlantsByTypeAsync(PlantType type);
        Task<ProductionData> GetProductionDataAsync(int plantId);
        Task<List<ProductionData>> GetProductionHistoryAsync(int plantId, DateTime startDate, DateTime endDate);
        Task<double> CalculateTotalProductionAsync(PlantType? type = null);
        Task<Dictionary<string, double>> GetProductionByTypeAsync();
        Task UpdatePlantStatusAsync(int plantId, string status);
        Task<EnergyPlant> CreatePlantAsync(object request);
        Task<List<EnergyPlant>> GetNearbyPlantsAsync(double latitude, double longitude, double radiusKm);
    }
} 