using System;
using System.Collections.Generic;
using System.Diagnostics.Tracing;
namespace EventManager.Domain.Entities
{
    public class TaskTemplate
    {
        public Guid Id { get; set; }
        public string TaskName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ICollection<EventTask> EventTasks { get; set; } = new List<EventTask>();
    }
}