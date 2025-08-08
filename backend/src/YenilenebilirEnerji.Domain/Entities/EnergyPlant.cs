using System;
using System.ComponentModel.DataAnnotations;

namespace YenilenebilirEnerji.Domain.Entities
{
    public class EnergyPlant
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        [Required]
        public double Capacity { get; set; }

        [Required]
        public PlantType Type { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = string.Empty;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
} 