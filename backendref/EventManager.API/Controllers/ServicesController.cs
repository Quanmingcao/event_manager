using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EventManager.Domain.Entities;
using EventManager.Infrastructure.Data;
namespace EventManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public ServicesController(ApplicationDbContext context)
        {
            _context = context;
        }
        /// <summary>
        /// Lấy danh sách tất cả dịch vụ
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Service>>> GetServices()
        {
            return await _context.Services.ToListAsync();
        }
        /// <summary>
        /// Lấy chi tiết một dịch vụ
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Service>> GetService(Guid id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return NotFound();
            }
            return service;
        }
        /// <summary>
        /// Tạo dịch vụ mới
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Service>> CreateService(Service service)
        {
            service.Id = Guid.NewGuid();
            _context.Services.Add(service);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetService), new { id = service.Id }, service);
        }
        /// <summary>
        /// Cập nhật dịch vụ
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateService(Guid id, Service service)
        {
            if (id != service.Id)
            {
                return BadRequest();
            }
            _context.Entry(service).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ServiceExists(id))
                {
                    return NotFound();
                }
                throw;
            }
            return NoContent();
        }
        /// <summary>
        /// Xóa dịch vụ
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteService(Guid id)
        {
            var service = await _context.Services.FindAsync(id);
            if (service == null)
            {
                return NotFound();
            }
            _context.Services.Remove(service);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        private bool ServiceExists(Guid id)
        {
            return _context.Services.Any(e => e.Id == id);
        }
    }
}