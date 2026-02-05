using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EventManager.Infrastructure.Data;
using EventManager.Domain.Entities;

namespace EventManager.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventStaffController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EventStaffController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/EventStaff
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventStaff>>> GetAllEventStaff()
        {
            return await _context.EventStaff
                .Include(es => es.Event)
                .ToListAsync();
        }

        // GET: api/EventStaff/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EventStaff>> GetEventStaff(Guid id)
        {
            var eventStaff = await _context.EventStaff
                .Include(es => es.Event)
                .FirstOrDefaultAsync(es => es.Id == id);

            if (eventStaff == null)
            {
                return NotFound();
            }

            return eventStaff;
        }

        // GET: api/EventStaff/event/{eventId}
        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<EventStaff>>> GetEventStaffByEvent(Guid eventId)
        {
            return await _context.EventStaff
                .Where(es => es.EventId == eventId)
                .OrderBy(es => es.FullName)
                .ToListAsync();
        }

        // POST: api/EventStaff
        [HttpPost]
        public async Task<ActionResult<EventStaff>> CreateEventStaff(EventStaff eventStaff)
        {
            eventStaff.Id = Guid.NewGuid();
            eventStaff.CreatedAt = DateTime.UtcNow;
            
            _context.EventStaff.Add(eventStaff);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEventStaff), new { id = eventStaff.Id }, eventStaff);
        }

        // POST: api/EventStaff/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult<IEnumerable<EventStaff>>> CreateBulkEventStaff(List<EventStaff> eventStaffList)
        {
            foreach (var eventStaff in eventStaffList)
            {
                eventStaff.Id = Guid.NewGuid();
                eventStaff.CreatedAt = DateTime.UtcNow;
            }

            _context.EventStaff.AddRange(eventStaffList);
            await _context.SaveChangesAsync();

            return Ok(eventStaffList);
        }

        // PUT: api/EventStaff/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEventStaff(Guid id, EventStaff eventStaff)
        {
            if (id != eventStaff.Id)
            {
                return BadRequest();
            }

            _context.Entry(eventStaff).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EventStaffExists(id))
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

        // DELETE: api/EventStaff/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEventStaff(Guid id)
        {
            var eventStaff = await _context.EventStaff.FindAsync(id);
            if (eventStaff == null)
            {
                return NotFound();
            }

            _context.EventStaff.Remove(eventStaff);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/EventStaff/event/{eventId}
        [HttpDelete("event/{eventId}")]
        public async Task<IActionResult> DeleteAllEventStaffByEvent(Guid eventId)
        {
            var eventStaffList = await _context.EventStaff
                .Where(es => es.EventId == eventId)
                .ToListAsync();

            _context.EventStaff.RemoveRange(eventStaffList);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EventStaffExists(Guid id)
        {
            return _context.EventStaff.Any(e => e.Id == id);
        }
    }
}
