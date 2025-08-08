using Microsoft.AspNetCore.Mvc;

namespace YenilenebilirEnerji.API.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new
            {
                message = "Yenilenebilir Enerji API'sine Hoş Geldiniz!",
                version = "1.0.0",
                endpoints = new
                {
                    weather = "/api/energy/weather/{latitude}/{longitude}",
                    solarRadiation = "/api/energy/solar-radiation/{latitude}/{longitude}",
                    plants = "/api/energy/plants",
                    production = "/api/energy/production/{plantId}",
                    // TEİAŞ Endpoint'leri
                    teiasRealTime = "/api/teias/real-time-production",
                    teiasWindPlants = "/api/teias/wind-power-plants",
                    teiasSolarPlants = "/api/teias/solar-power-plants",
                    teiasPlantProduction = "/api/teias/plant/{plantId}/production",
                    teiasRegionalProduction = "/api/teias/regional-production?region={region}",
                    swagger = "/swagger"
                },
                description = "Bu API yenilenebilir enerji santralleri için hava durumu, üretim verilerini ve TEİAŞ gerçek zamanlı verilerini sağlar."
            });
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        }
    }
} 