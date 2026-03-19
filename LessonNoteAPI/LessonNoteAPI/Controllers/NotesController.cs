using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace LessonNoteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Tüm işlemler için Token gerekli
    public class NotesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotesController(AppDbContext context)
        {
            _context = context;
        }

        // KULLANICIYA ÖZEL LİSTELEME (Aktif Notlar)
        [HttpGet("my-notes")]
        public async Task<ActionResult<IEnumerable<Note>>> GetMyActiveNotes()
        {
            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var userId = int.Parse(userIdString);

            return await _context.Notes
                .Where(n => n.UserId == userId && !n.IsDeleted)
                .ToListAsync();
        }

        // ARŞİVLENMİŞ NOTLARI LİSTELEME
        [HttpGet("archive")]
        public async Task<ActionResult<IEnumerable<Note>>> GetArchivedNotes()
        {
            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            var userId = int.Parse(userIdString);

            return await _context.Notes
                .Where(n => n.UserId == userId && n.IsDeleted)
                .ToListAsync();
        }

        //YENİ NOT EKLEME
        [HttpPost]
        public async Task<ActionResult<Note>> PostNote([FromBody] Note note)
        {
            var userIdString = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();

            try
            {
                note.UserId = int.Parse(userIdString);
                note.CreatedDate = DateTime.Now;
                note.UpdatedDate = DateTime.Now;
                note.User = null; // EF Core döngüsünü engellemek için
                note.IsDeleted = false;

                _context.Notes.Add(note);
                await _context.SaveChangesAsync();
                return Ok(note);
            }
            catch (Exception ex)
            {
                return BadRequest($"Not kaydedilirken bir hata oluştu: {ex.Message}");
            }
        }

        // SOFT DELETE: Notu Arşive Gönderir
        [HttpDelete("soft-delete/{id}")]
        public async Task<IActionResult> SoftDeleteNote(int id)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null) return NotFound();

            note.IsDeleted = true; // Sadece işaretliyoruz
            note.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok("Not arşivlendi.");
        }

        //HARD DELETE: Arşivden Kalıcı Olarak Siler
        [HttpDelete("hard-delete/{id}")]
        public async Task<IActionResult> HardDeleteNote(int id)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null) return NotFound();

            // Sadece arşivlenmiş notlar kalıcı silinebilir
            if (!note.IsDeleted)
            {
                return BadRequest("Kalıcı silme işlemi için notun önce arşivlenmiş olması gerekir.");
            }

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();
            return Ok("Not veritabanından tamamen silindi.");
        }

        // NOT GÜNCELLEME
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, [FromBody] Note updatedNote)
        {
            var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == id);
            if (note == null) return NotFound("Not bulunamadı.");

            note.Title = updatedNote.Title;
            note.Description = updatedNote.Description;
            note.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok("Not başarıyla güncellendi.");
        }

        //DOSYA YÜKLEME
        [HttpPost("upload-file/{noteId}")]
        public async Task<IActionResult> UploadFile(int noteId, IFormFile file)
        {
            var note = await _context.Notes.FindAsync(noteId);
            if (note == null) return NotFound("Not bulunamadı.");

            if (file == null || file.Length == 0)
                return BadRequest("Lütfen geçerli bir dosya seçin.");

            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
            if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            note.FileName = file.FileName;
            note.FilePath = filePath;
            note.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Dosya başarıyla yüklendi.", fileName = file.FileName });
        }

        // DOSYA BAĞINI KALDIRMA
        [HttpPost("remove-file/{id}")]
        public async Task<IActionResult> RemoveFile(int id)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null) return NotFound();

            note.FileName = null;
            note.FilePath = null;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // GERİ YÜKLEME (Arşivden Çıkarma)
        [HttpPost("restore/{id}")]
        public async Task<IActionResult> RestoreNote(int id)
        {
            var note = await _context.Notes.FirstOrDefaultAsync(n => n.Id == id);
            if (note == null) return NotFound("Not bulunamadı.");

            note.IsDeleted = false; // Geri getiriyoruz
            note.UpdatedDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok("Not başarıyla geri yüklendi.");
        }
    }
}