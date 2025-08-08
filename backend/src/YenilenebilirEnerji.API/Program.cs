using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using YenilenebilirEnerji.Application.Interfaces;
using YenilenebilirEnerji.Infrastructure.Data;
using YenilenebilirEnerji.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// HTTP client configuration
builder.Services.AddHttpClient("NASA", client =>
{
    client.BaseAddress = new Uri("https://power.larc.nasa.gov/");
    client.Timeout = TimeSpan.FromSeconds(30);
});

// JWT Configuration
var jwtSecret = builder.Configuration["JWT:Secret"] ?? "YenilenebilirEnerji2025SecretKeyForJWTTokenGeneration";
var jwtIssuer = builder.Configuration["JWT:Issuer"] ?? "YenilenebilirEnerji";
var jwtAudience = builder.Configuration["JWT:Audience"] ?? "YenilenebilirEnerji";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Service registrations
builder.Services.AddScoped<IWeatherService, WeatherService>();
builder.Services.AddScoped<IEnergyProductionService, EnergyProductionService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Ensure database is created and migrations are applied
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.Migrate();
    
    // Seed regions data
    try
    {
        RegionSeedData.SeedRegions(context);
        EnergyPlantSeedData.SeedEnergyPlants(context);
        UserSeedData.SeedUsers(context);
    }
    catch (Exception ex)
    {
        // Log the error but don't crash the application
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Error seeding data");
    }
}

app.Run();
