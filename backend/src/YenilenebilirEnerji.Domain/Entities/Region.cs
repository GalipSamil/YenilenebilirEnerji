using System.ComponentModel.DataAnnotations;

namespace YenilenebilirEnerji.Domain.Entities
{
    public class Region
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
        [MaxLength(50)]
        public string EnergyType { get; set; } = string.Empty; // solar, wind, geothermal
        
        public double Capacity { get; set; } // MW cinsinden kapasite
        
        [MaxLength(200)]
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
    }
} 