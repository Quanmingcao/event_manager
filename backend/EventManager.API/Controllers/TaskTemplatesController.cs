using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EventManager.Domain.Entities;
using EventManager.Infrastructure.Data;
namespace EventManager.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TaskTemplatesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public TaskTemplatesController(ApplicationDbContext context)
        {
            _context = context;
        }
        /// <summary>
        /// Lấy danh sách tất cả mẫu công việc
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskTemplate>>> GetTaskTemplates()
        {
            return await _context.TaskTemplates.ToListAsync();
        }
        /// <summary>
        /// Lấy chi tiết một mẫu công việc
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskTemplate>> GetTaskTemplate(Guid id)
        {
            var taskTemplate = await _context.TaskTemplates.FindAsync(id);
            if (taskTemplate == null)
            {
                return NotFound();
            }
            return taskTemplate;
        }
        /// <summary>
        /// Tạo mẫu công việc mới
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<TaskTemplate>> CreateTaskTemplate(TaskTemplate taskTemplate)
        {
            taskTemplate.Id = Guid.NewGuid();
            _context.TaskTemplates.Add(taskTemplate);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTaskTemplate), new { id = taskTemplate.Id }, taskTemplate);
        }
        /// <summary>
        /// Cập nhật mẫu công việc
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTaskTemplate(Guid id, TaskTemplate taskTemplate)
        {
            if (id != taskTemplate.Id)
            {
                return BadRequest();
            }
            _context.Entry(taskTemplate).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TaskTemplateExists(id))
                {
                    return NotFound();
                }
                throw;
            }
            return NoContent();
        }
        /// <summary>
        /// Xóa mẫu công việc
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTaskTemplate(Guid id)
        {
            var taskTemplate = await _context.TaskTemplates.FindAsync(id);
            if (taskTemplate == null)
            {
                return NotFound();
            }
            _context.TaskTemplates.Remove(taskTemplate);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        private bool TaskTemplateExists(Guid id)
        {
            return _context.TaskTemplates.Any(e => e.Id == id);
        }
    }
}