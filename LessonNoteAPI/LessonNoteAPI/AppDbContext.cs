using Microsoft.EntityFrameworkCore;

namespace LessonNoteAPI
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Note> Notes { get; set; }

        //  SEEDER 
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Örnek Kullanıcı Tohumlama
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                FullName = "Nursima Test",
                Email = "test@nursima.com",
                Password = "123"
            });

            // 2. Örnek Notlar Tohumlama
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 999,
                    Email = "test@nursima.com",
                    FullName = "Nursima Test",
                    Password = "123"
                }
            );

            modelBuilder.Entity<Note>().HasData(
                new Note
                {
                    Id = 998,
                    Title = "Mülakat Hazırlığı 📚",
                    Description = "Seeder verisi",
                    CreatedDate = DateTime.Now,
                    UpdatedDate = DateTime.Now,
                    IsDeleted = false,
                    UserId = 999
                }
            );
        }
    }
}