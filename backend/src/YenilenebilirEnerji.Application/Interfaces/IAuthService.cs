using YenilenebilirEnerji.Domain.Models;

namespace YenilenebilirEnerji.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request);
        Task<bool> RevokeTokenAsync(string refreshToken);
        Task<bool> ValidateUserAsync(string email, string password);
    }
} 