using System.Security.Claims;
using YenilenebilirEnerji.Domain.Entities;

namespace YenilenebilirEnerji.Application.Interfaces
{
    public interface ITokenService
    {
        string GenerateAccessToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
        bool ValidateToken(string token);
    }
} 