namespace YenilenebilirEnerji.Domain.Models
{
    public class WeatherData
    {
        public double Temperature { get; set; }
        public double WindSpeed { get; set; }
        public double SolarRadiation { get; set; }
        public double Humidity { get; set; }
        public double Pressure { get; set; }
        public string WeatherCondition { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        // Hesaplanan özellikler
        public double SolarIrradiance => SolarRadiation;
    }
} 