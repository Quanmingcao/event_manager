using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EventManager.Domain.Entities;
using EventManager.Infrastructure.Data;
namespace EventManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class StaffController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public StaffController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Staff>>> GetStaff()
        {
            return await _context.Staff.ToListAsync();
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Staff>> GetStaffMember(Guid id)
        {
            var staff = await _context.Staff.FindAsync(id);
            if (staff == null)
                return NotFound();
            return staff;
        }
        [HttpPost]
        public async Task<ActionResult<Staff>> CreateStaff(Staff staff)
        {
            staff.Id = Guid.NewGuid();
            _context.Staff.Add(staff);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetStaffMember), new { id = staff.Id }, staff);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStaff(Guid id, Staff staff)
        {
            if (id != staff.Id)
                return BadRequest();
            _context.Entry(staff).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStaff(Guid id)
        {
            var staff = await _context.Staff.FindAsync(id);
            if (staff == null)
                return NotFound();
            _context.Staff.Remove(staff);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}