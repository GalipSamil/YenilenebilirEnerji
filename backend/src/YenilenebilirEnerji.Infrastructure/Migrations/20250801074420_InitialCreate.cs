using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace YenilenebilirEnerji.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EnergyPlants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Latitude = table.Column<double>(type: "REAL", nullable: false),
                    Longitude = table.Column<double>(type: "REAL", nullable: false),
                    Capacity = table.Column<double>(type: "REAL", nullable: false),
                    Type = table.Column<string>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnergyPlants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductionData",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    PlantId = table.Column<int>(type: "INTEGER", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    CurrentProduction = table.Column<double>(type: "REAL", nullable: false),
                    Efficiency = table.Column<double>(type: "REAL", nullable: false),
                    WeatherCondition = table.Column<string>(type: "TEXT", nullable: false),
                    Temperature = table.Column<double>(type: "REAL", nullable: false),
                    WindSpeed = table.Column<double>(type: "REAL", nullable: false),
                    SolarRadiation = table.Column<double>(type: "REAL", nullable: false),
                    ProductionByType = table.Column<string>(type: "TEXT", nullable: false),
                    HourlyData = table.Column<string>(type: "TEXT", nullable: false),
                    PlantType = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductionData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductionData_EnergyPlants_PlantId",
                        column: x => x.PlantId,
                        principalTable: "EnergyPlants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductionData_PlantId",
                table: "ProductionData",
                column: "PlantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductionData");

            migrationBuilder.DropTable(
                name: "EnergyPlants");
        }
    }
}
