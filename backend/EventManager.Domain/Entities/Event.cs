using System;
using System.Collections.Generic;
using System.Diagnostics.Tracing;
namespace EventManager.Domain.Entities
{
    public class Event
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Organizer { get; set; }
        public DateTime? StartDate { get; set; }
        public string? Location { get; set; }
        public string? Format { get; set; }
        public string? ScriptLink { get; set; }
        public string? TimelineLink { get; set; }
        public string Status { get; set; } = "Planning";
        public string? OutcomeSummary { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<EventTask> EventTasks { get; set; } = new List<EventTask>();
        public ICollection<EventFinance> EventFinances { get; set; } = new List<EventFinance>();
    }
}