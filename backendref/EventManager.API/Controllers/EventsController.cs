using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EventManager.Domain.Entities;
using EventManager.Infrastructure.Data;
namespace EventManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    
    public class EventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public EventsController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Event>>> GetEvents()
        {
            return await _context.Events
                .Include(e => e.EventTasks)
                .Include(e => e.EventFinances)
                .ToListAsync();
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Event>> GetEvent(Guid id)
        {
            var eventItem = await _context.Events
                .Include(e => e.EventTasks)
                    .ThenInclude(t => t.Staff)
                .Include(e => e.EventTasks)
                    .ThenInclude(t => t.Task)
                .Include(e => e.EventFinances)
                    .ThenInclude(f => f.Service)
                .FirstOrDefaultAsync(e => e.Id == id);
            if (eventItem == null)
                return NotFound();
            return eventItem;
        }
        [HttpPost]
        public async Task<ActionResult<Event>> CreateEvent(Event eventItem)
        {
            eventItem.Id = Guid.NewGuid();
            eventItem.CreatedAt = DateTime.UtcNow;
            _context.Events.Add(eventItem);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEvent), new { id = eventItem.Id }, eventItem);
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(Guid id, Event eventItem)
        {
            var existing = await _context.Events.FindAsync(id);
            if (existing == null)
                return NotFound();

            // Update only non-null fields (PATCH semantics)
            if (!string.IsNullOrEmpty(eventItem.Name))
                existing.Name = eventItem.Name;
            if (!string.IsNullOrEmpty(eventItem.Organizer))
                existing.Organizer = eventItem.Organizer;
            if (!string.IsNullOrEmpty(eventItem.Location))
                existing.Location = eventItem.Location;
            if (!string.IsNullOrEmpty(eventItem.Format))
                existing.Format = eventItem.Format;
            if (!string.IsNullOrEmpty(eventItem.Status))
                existing.Status = eventItem.Status;
            if (eventItem.StartDate.HasValue)
                existing.StartDate = eventItem.StartDate;
            if (!string.IsNullOrEmpty(eventItem.OutcomeSummary))
                existing.OutcomeSummary = eventItem.OutcomeSummary;
            
            // Handle nullable string fields (allow clearing)
            if (eventItem.ScriptLink != null)
                existing.ScriptLink = eventItem.ScriptLink;
            if (eventItem.TimelineLink != null)
                existing.TimelineLink = eventItem.TimelineLink;

            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            var eventItem = await _context.Events.FindAsync(id);
            if (eventItem == null)
                return NotFound();
            _context.Events.Remove(eventItem);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}