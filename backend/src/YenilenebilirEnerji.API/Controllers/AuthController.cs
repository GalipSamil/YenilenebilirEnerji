using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using YenilenebilirEnerji.Application.Interfaces;
using YenilenebilirEnerji.Domain.Models;
using YenilenebilirEnerji.Infrastructure.Data;

namespace YenilenebilirEnerji.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        private readonly ApplicationDbContext _context;

        public AuthController(IAuthService authService, ILogger<AuthController> logger, ApplicationDbContext context)
        {
            _authService = authService;
            _logger = logger;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var response = await _authService.LoginAsync(request);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Login failed for email: {Email}", request.Email);
                return Unauthorized(new { message = "Invalid email or password" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var response = await _authService.RegisterAsync(request);
                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Registration failed for email: {Email}", request.Email);
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for email: {Email}", request.Email);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        // Geçici endpoint - kullanıcıyı admin yapmak için
        [HttpPost("make-admin/{email}")]
        public async Task<ActionResult> MakeAdmin(string email)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                user.Role = "Admin";
                await _context.SaveChangesAsync();

                return Ok(new { message = $"User {email} is now an Admin" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error making user admin: {Email}", email);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var response = await _authService.RefreshTokenAsync(request);
                return Ok(response);
            }
            catch (SecurityTokenException ex)
            {
                _logger.LogWarning(ex, "Token refresh failed");
                return Unauthorized(new { message = "Invalid token" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token refresh");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("revoke-token")]
        [Authorize]
        public async Task<ActionResult> RevokeToken([FromBody] string refreshToken)
        {
            try
            {
                var result = await _authService.RevokeTokenAsync(refreshToken);
                
                if (!result)
                {
                    return BadRequest(new { message = "Invalid refresh token" });
                }

                return Ok(new { message = "Token revoked successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during token revocation");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public ActionResult Logout()
        {
            try
            {
                // Get refresh token from user claims or request
                var userId = User.FindFirst("userId")?.Value;
                
                if (string.IsNullOrEmpty(userId))
                {
                    return BadRequest(new { message = "Invalid user" });
                }

                // In a real implementation, you might want to blacklist the current token
                // For now, we'll just return success
                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public ActionResult<UserInfo> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst("userId")?.Value;
                var name = User.FindFirst("name")?.Value;
                var email = User.FindFirst("email")?.Value;
                var role = User.FindFirst("role")?.Value;

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                return Ok(new UserInfo
                {
                    Id = int.Parse(userId),
                    Name = name ?? "",
                    Email = email ?? "",
                    Role = role ?? ""
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current user");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
} 