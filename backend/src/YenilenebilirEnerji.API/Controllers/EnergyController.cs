using Microsoft.AspNetCore.Mvc;
using YenilenebilirEnerji.Application.Interfaces;
using YenilenebilirEnerji.Domain.Entities;

namespace YenilenebilirEnerji.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnergyController : ControllerBase
    {
        private readonly IEnergyProductionService _energyService;
        private readonly IWeatherService _weatherService;

        public EnergyController(IEnergyProductionService energyService, IWeatherService weatherService)
        {
            _energyService = energyService;
            _weatherService = weatherService;
        }

        [HttpGet("plants")]
        public async Task<ActionResult<List<EnergyPlant>>> GetAllPlants()
        {
            try
            {
                var plants = await _energyService.GetAllPlantsAsync();
                return Ok(plants);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Tesisler alınırken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("plants/{id}")]
        public async Task<ActionResult<EnergyPlant>> GetPlantById(int id)
        {
            try
            {
                var plant = await _energyService.GetPlantByIdAsync(id);
                return Ok(plant);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Tesis bilgisi alınırken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("plants/type/{type}")]
        public async Task<ActionResult<List<EnergyPlant>>> GetPlantsByType(PlantType type)
        {
            try
            {
                var plants = await _energyService.GetPlantsByTypeAsync(type);
                return Ok(plants);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Tesisler alınırken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("production/{plantId}")]
        public async Task<ActionResult<ProductionData>> GetProductionData(int plantId)
        {
            try
            {
                var data = await _energyService.GetProductionDataAsync(plantId);
                return Ok(data);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Üretim verisi alınırken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("production/{plantId}/history")]
        public async Task<ActionResult<List<ProductionData>>> GetProductionHistory(
            int plantId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var history = await _energyService.GetProductionHistoryAsync(plantId, startDate, endDate);
                return Ok(history);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Üretim geçmişi alınırken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("production/total")]
        public async Task<ActionResult<double>> GetTotalProduction([FromQuery] PlantType? type = null)
        {
            try
            {
                var total = await _energyService.CalculateTotalProductionAsync(type);
                return Ok(total);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Toplam üretim hesaplanırken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("production/by-type")]
        public async Task<ActionResult<Dictionary<string, double>>> GetProductionByType()
        {
            try
            {
                var data = await _energyService.GetProductionByTypeAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Tesis tipine göre üretim alınırken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpPut("plants/{plantId}/status")]
        public async Task<ActionResult> UpdatePlantStatus(int plantId, [FromBody] string status)
        {
            try
            {
                await _energyService.UpdatePlantStatusAsync(plantId, status);
                return Ok(new { message = "Tesis durumu güncellendi" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Tesis durumu güncellenirken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpPost("plants")]
        public async Task<ActionResult<EnergyPlant>> CreatePlant([FromBody] CreatePlantRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var plant = await _energyService.CreatePlantAsync(request);
                return CreatedAtAction(nameof(GetPlantById), new { id = plant.Id }, plant);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Tesis oluşturulurken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("weather/{latitude}/{longitude}")]
        public async Task<ActionResult> GetWeatherData(double latitude, double longitude)
        {
            try
            {
                var weatherData = await _weatherService.GetWeatherDataAsync(latitude, longitude);
                return Ok(weatherData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Hava durumu verisi alınırken bir hata oluştu", error = ex.Message });
            }
        }

        [HttpGet("nearby/{latitude}/{longitude}")]
        public async Task<ActionResult> GetNearbyPlants(double latitude, double longitude, [FromQuery] double radiusKm = 100)
        {
            try
            {
                var nearbyPlants = await _energyService.GetNearbyPlantsAsync(latitude, longitude, radiusKm);
                return Ok(nearbyPlants);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Yakındaki santraller bulunurken bir hata oluştu", error = ex.Message });
            }
        }
    }

    public class CreatePlantRequest
    {
        public string Name { get; set; } = string.Empty;
        public PlantType Type { get; set; }
        public double Capacity { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
} 