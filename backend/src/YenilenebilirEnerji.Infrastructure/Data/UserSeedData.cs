using YenilenebilirEnerji.Domain.Entities;
using System.Security.Cryptography;
using System.Text;

namespace YenilenebilirEnerji.Infrastructure.Data
{
    public static class UserSeedData
    {
        public static void SeedUsers(ApplicationDbContext context)
        {
            if (context.Users.Any())
                return;

            // Create admin user
            var adminUser = new User
            {
                Name = "Admin User",
                Email = "admin@yenilenebilir.enerji",
                PasswordHash = HashPassword("admin123"),
                Role = "Admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
            context.SaveChanges();
        }

        private static string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "YenilenebilirEnerji2025Salt"));
            return Convert.ToBase64String(hashedBytes);
        }
    }
} 