using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LessonNoteAPI.Migrations
{
    public partial class SeedDataUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //Kullanıcıyı ekleme 
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "FullName", "Password" },
                values: new object[] { 999, "test@nursima.com", "Nursima Test", "123" });

            // Sonra bu kullanıcıya bağlı Notları ekliyoruz
            migrationBuilder.InsertData(
                table: "Notes",
                columns: new[] { "Id", "CreatedDate", "Description", "FileName", "FilePath", "IsDeleted", "Title", "UpdatedDate", "UserId" },
                values: new object[,]
                {
                    { 998, DateTime.Now, "Seeder verileri başarıyla yüklendi, her şey yolunda.", null, null, false, "Mülakat Hazırlığı 📚", DateTime.Now, 999 },
                    { 999, DateTime.Now, "Bu bir örnek nottur. Sistemin çalıştığını kanıtlar.", null, null, false, "Hoş Geldiniz! ✨", DateTime.Now, 999 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Geri alma (Rollback) işlemi için eklenen verileri siliyoruz
            migrationBuilder.DeleteData(
                table: "Notes",
                keyColumn: "Id",
                keyValue: 998);

            migrationBuilder.DeleteData(
                table: "Notes",
                keyColumn: "Id",
                keyValue: 999);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 999);
        }
    }
}