using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EventManager.Domain.Entities;
using EventManager.Infrastructure.Data;
namespace EventManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventFinancesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public EventFinancesController(ApplicationDbContext context)
        {
            _context = context;
        }
        /// <summary>
        /// Lấy tất cả bản ghi tài chính
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventFinance>>> GetEventFinances()
        {
            return await _context.EventFinances
                .Include(ef => ef.Event)
                .Include(ef => ef.Service)
                .ToListAsync();
        }
        /// <summary>
        /// Lấy tài chính theo sự kiện
        /// </summary>
        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<EventFinance>>> GetEventFinancesByEvent(Guid eventId)
        {
            return await _context.EventFinances
                .Include(ef => ef.Service)
                .Where(ef => ef.EventId == eventId)
                .ToListAsync();
        }
        /// <summary>
        /// Lấy tổng hợp tài chính của sự kiện
        /// </summary>
        [HttpGet("summary/{eventId}")]
        public async Task<ActionResult> GetEventFinanceSummary(Guid eventId)
        {
            var finances = await _context.EventFinances
                .Include(ef => ef.Service)
                .Where(ef => ef.EventId == eventId)
                .ToListAsync();
            var summary = new
            {
                EventId = eventId,
                EstimatedTotal = finances.Sum(f => f.EstimatedAmount),
                ExtraTotal = finances.Sum(f => f.ExtraAmount),
                GrandTotal = finances.Sum(f => f.EstimatedAmount + f.ExtraAmount),
                ItemCount = finances.Count,
                Items = finances.Select(f => new
                {
                    f.Id,
                    ServiceName = f.ServiceName ?? f.Service?.ServiceName ?? "N/A",
                    f.EstimatedAmount,
                    f.ExtraAmount,
                    Total = f.EstimatedAmount + f.ExtraAmount,
                    f.EstimatedNote,
                    f.ExtraNote
                })
            };
            return Ok(summary);
        }
        /// <summary>
        /// Lấy chi tiết một bản ghi tài chính
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<EventFinance>> GetEventFinance(Guid id)
        {
            var eventFinance = await _context.EventFinances
                .Include(ef => ef.Event)
                .Include(ef => ef.Service)
                .FirstOrDefaultAsync(ef => ef.Id == id);
            if (eventFinance == null)
            {
                return NotFound();
            }
            return eventFinance;
        }
        /// <summary>
        /// Tạo bản ghi tài chính mới
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<EventFinance>> CreateEventFinance(EventFinance eventFinance)
        {
            eventFinance.Id = Guid.NewGuid();
            _context.EventFinances.Add(eventFinance);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEventFinance), new { id = eventFinance.Id }, eventFinance);
        }
        /// <summary>
        /// Cập nhật bản ghi tài chính
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEventFinance(Guid id, EventFinance eventFinance)
        {
            if (id != eventFinance.Id)
            {
                return BadRequest();
            }

            var existing = await _context.EventFinances.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            // Cập nhật các trường thông tin
            existing.ServiceId = eventFinance.ServiceId;
            existing.ServiceName = eventFinance.ServiceName;
            existing.EstimatedAmount = eventFinance.EstimatedAmount;
            existing.EstimatedNote = eventFinance.EstimatedNote;
            existing.ExtraAmount = eventFinance.ExtraAmount;
            existing.ExtraNote = eventFinance.ExtraNote;
            existing.EventId = eventFinance.EventId; // Đảm bảo EventId vẫn đúng

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Re-throw to be caught by global error handler but now with more context during debug
                throw;
            }

            return NoContent();
        }
        /// <summary>
        /// Xóa bản ghi tài chính
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEventFinance(Guid id)
        {
            var eventFinance = await _context.EventFinances.FindAsync(id);
            if (eventFinance == null)
            {
                return NotFound();
            }
            _context.EventFinances.Remove(eventFinance);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
