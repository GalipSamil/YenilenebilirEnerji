using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace YenilenebilirEnerji.Domain.Entities
{
    public class ProductionData
    {
        public int Id { get; set; }
        
        [Required]
        public int PlantId { get; set; }
        
        [Required]
        public DateTime Timestamp { get; set; }
        
        [Required]
        public double CurrentProduction { get; set; }
        
        [Required]
        public double Efficiency { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string WeatherCondition { get; set; } = string.Empty;
        
        [Required]
        public double Temperature { get; set; }
        
        [Required]
        public double WindSpeed { get; set; }
        
        [Required]
        public double SolarRadiation { get; set; }
        
        [Required]
        public Dictionary<string, double> ProductionByType { get; set; } = new();
        
        [Required]
        public List<HourlyProductionData> HourlyData { get; set; } = new();
        
        [Required]
        public PlantType PlantType { get; set; }
    }

    public class HourlyProductionData
    {
        public DateTime Hour { get; set; }
        public double Production { get; set; }
        public double Efficiency { get; set; }
    }
} 