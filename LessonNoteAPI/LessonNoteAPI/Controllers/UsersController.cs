using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace LessonNoteAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // Kayıt Olma (Register)
        [HttpPost("register")]
        public async Task<ActionResult<User>> Register([FromBody] User user)
        {
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                return BadRequest("Bu e-posta adresi zaten kayıtlı.");

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        // Giriş Yapma (Login) 
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login([FromBody] User loginInfo)
        {
            // Kullanıcıyı veritabanında arama
            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == loginInfo.Email && u.Password == loginInfo.Password);

            if (user == null)
                return Unauthorized("E-posta veya şifre hatalı!");

            // Token oluşturma işlemleri
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("bu_benim_cok_guvenli_ve_uzun_staj_projesi_anahtarim_123456");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    // Token'ın içine kullanıcının ID'sini gömüyoruz
                    new Claim("userId", user.Id.ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(2), // 2 saat sonra iptal olur
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // Başarılı girişte Token metnini dönüyoruz
            return Ok(tokenString);
        }
    }
}