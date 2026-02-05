using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EventManager.Domain.Entities;
using EventManager.Infrastructure.Data;

namespace EventManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfilesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProfilesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Profile>>> GetProfiles()
        {
            return await _context.Profiles.OrderBy(p => p.Email).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Profile>> GetProfile(Guid id)
        {
            var profile = await _context.Profiles.FindAsync(id);

            if (profile == null)
            {
                return NotFound();
            }

            return profile;
        }

        [HttpPost]
        public async Task<ActionResult<Profile>> CreateProfile(Profile profile)
        {
            // Kiểm tra sự tồn tại thực tế trong DB (không dùng cache)
            var exists = await _context.Profiles.AnyAsync(p => p.Id == profile.Id);
            
            if (exists)
            {
                _context.Entry(profile).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return Ok(profile);
            }

            if (profile.CreatedAt == default)
            {
                profile.CreatedAt = DateTime.UtcNow;
            }

            try
            {
                _context.Profiles.Add(profile);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                // Nếu vẫn dính lỗi trùng khóa (do Trigger vừa chèn xong)
                if (ex.InnerException is Npgsql.PostgresException pgEx && pgEx.SqlState == "23505")
                {
                    _context.ChangeTracker.Clear();
                    _context.Entry(profile).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                    return Ok(profile);
                }
                throw;
            }

            return CreatedAtAction(nameof(GetProfile), new { id = profile.Id }, profile);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(Guid id, Profile profile)
        {
            if (id != profile.Id)
            {
                return BadRequest();
            }

            _context.Entry(profile).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProfileExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProfile(Guid id)
        {
            var profile = await _context.Profiles.FindAsync(id);
            if (profile == null)
            {
                return NotFound();
            }

            _context.Profiles.Remove(profile);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProfileExists(Guid id)
        {
            return _context.Profiles.Any(e => e.Id == id);
        }
    }
}
