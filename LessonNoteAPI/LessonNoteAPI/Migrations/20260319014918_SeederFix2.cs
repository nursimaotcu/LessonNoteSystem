using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 

namespace LessonNoteAPI.Migrations
{
    /// <inheritdoc />
    public partial class SeederFix2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Notes",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Notes",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "FullName", "Password" },
                values: new object[] { 1001, "test@nursima.com", "Nursima Test", "123" });

            migrationBuilder.InsertData(
                table: "Notes",
                columns: new[] { "Id", "CreatedDate", "Description", "FileName", "FilePath", "IsDeleted", "Title", "UpdatedDate", "UserId" },
                values: new object[] { 1002, new DateTime(2026, 3, 19, 4, 49, 17, 552, DateTimeKind.Local).AddTicks(2115), "Seeder verisi", null, null, false, "Mülakat Hazırlığı 📚", new DateTime(2026, 3, 19, 4, 49, 17, 552, DateTimeKind.Local).AddTicks(2116), 999 });

            migrationBuilder.CreateIndex(
                name: "IX_Notes_UserId",
                table: "Notes",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notes_Users_UserId",
                table: "Notes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notes_Users_UserId",
                table: "Notes");

            migrationBuilder.DropIndex(
                name: "IX_Notes_UserId",
                table: "Notes");

            migrationBuilder.DeleteData(
                table: "Notes",
                keyColumn: "Id",
                keyValue: 1002);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1001);

            migrationBuilder.InsertData(
                table: "Notes",
                columns: new[] { "Id", "CreatedDate", "Description", "FileName", "FilePath", "IsDeleted", "Title", "UpdatedDate", "UserId" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 17, 9, 14, 12, 925, DateTimeKind.Local).AddTicks(318), "Bu bir örnek nottur. Sistemin çalıştığını kanıtlar.", null, null, false, "Hoş Geldiniz! ✨", new DateTime(2026, 3, 17, 9, 14, 12, 925, DateTimeKind.Local).AddTicks(314), 1 },
                    { 2, new DateTime(2026, 3, 17, 9, 14, 12, 925, DateTimeKind.Local).AddTicks(321), "Seeder verileri başarıyla yüklendi, her şey yolunda.", null, null, false, "Mülakat Hazırlığı 📚", new DateTime(2026, 3, 17, 9, 14, 12, 925, DateTimeKind.Local).AddTicks(320), 1 }
                });
        }
    }
}
