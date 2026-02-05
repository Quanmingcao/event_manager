using System;
using System.Collections.Generic;
using System.Diagnostics.Tracing;
namespace EventManager.Domain.Entities
{
    public class Staff
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? StaffType { get; set; }
        public string? Phone { get; set; }
        public string? Department { get; set; }
        public ICollection<EventTask> EventTasks { get; set; } = new List<EventTask>();
    }
}