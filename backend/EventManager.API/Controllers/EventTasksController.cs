using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EventManager.Domain.Entities;
using EventManager.Infrastructure.Data;
namespace EventManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventTasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public EventTasksController(ApplicationDbContext context)
        {
            _context = context;
        }
        /// <summary>
        /// Lấy tất cả phân công công việc
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventTask>>> GetEventTasks()
        {
            return await _context.EventTasks
                .Include(et => et.Event)
                .Include(et => et.Task)
                .Include(et => et.Staff)
                .ToListAsync();
        }
        /// <summary>
        /// Lấy phân công theo sự kiện
        /// </summary>
        [HttpGet("event/{eventId}")]
        public async Task<ActionResult<IEnumerable<EventTask>>> GetEventTasksByEvent(Guid eventId)
        {
            return await _context.EventTasks
                .Include(et => et.Task)
                .Include(et => et.Staff)
                .Where(et => et.EventId == eventId)
                .ToListAsync();
        }
        /// <summary>
        /// Lấy phân công theo nhân viên
        /// </summary>
        [HttpGet("staff/{staffId}")]
        public async Task<ActionResult<IEnumerable<EventTask>>> GetEventTasksByStaff(Guid staffId)
        {
            return await _context.EventTasks
                .Include(et => et.Event)
                .Include(et => et.Task)
                .Where(et => et.StaffId == staffId)
                .ToListAsync();
        }
        /// <summary>
        /// Lấy chi tiết một phân công
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<EventTask>> GetEventTask(Guid id)
        {
            var eventTask = await _context.EventTasks
                .Include(et => et.Event)
                .Include(et => et.Task)
                .Include(et => et.Staff)
                .FirstOrDefaultAsync(et => et.Id == id);
            if (eventTask == null)
            {
                return NotFound();
            }
            return eventTask;
        }
        /// <summary>
        /// Tạo phân công mới
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<EventTask>> CreateEventTask(EventTask eventTask)
        {
            eventTask.Id = Guid.NewGuid();
            _context.EventTasks.Add(eventTask);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetEventTask), new { id = eventTask.Id }, eventTask);
        }
        /// <summary>
        /// Tạo nhiều phân công cùng lúc (từ Excel import)
        /// </summary>
        [HttpPost("bulk")]
        public async Task<ActionResult<IEnumerable<EventTask>>> CreateEventTasksBulk(List<EventTask> eventTasks)
        {
            foreach (var task in eventTasks)
            {
                task.Id = Guid.NewGuid();
            }
            _context.EventTasks.AddRange(eventTasks);
            await _context.SaveChangesAsync();
            return Ok(eventTasks);
        }
        /// <summary>
        /// Cập nhật phân công
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEventTask(Guid id, EventTask eventTask)
        {
            if (id != eventTask.Id)
            {
                return BadRequest();
            }
            _context.Entry(eventTask).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        /// <summary>
        /// Cập nhật trạng thái phân công
        /// </summary>
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateEventTaskStatus(Guid id, [FromBody] string status)
        {
            var eventTask = await _context.EventTasks.FindAsync(id);
            if (eventTask == null)
            {
                return NotFound();
            }
            eventTask.Status = status;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        /// <summary>
        /// Xóa phân công
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEventTask(Guid id)
        {
            var eventTask = await _context.EventTasks.FindAsync(id);
            if (eventTask == null)
            {
                return NotFound();
            }
            _context.EventTasks.Remove(eventTask);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}