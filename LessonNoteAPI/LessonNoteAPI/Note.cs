namespace LessonNoteAPI
{
    public class Note
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? FileName { get; set; } // Dosyanın adı
        public string? FilePath { get; set; } // Dosyanın sunucudaki yolu
        public DateTime CreatedDate { get; set; } = DateTime.Now; // Otomatik eklenme tarihi
        public DateTime UpdatedDate { get; set; } = DateTime.Now; // Otomatik güncellenme tarihi

        public int UserId { get; set; }
        public User? User { get; set; }
        public bool IsDeleted { get; set; } = false;
    }
}