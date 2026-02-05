using System;
namespace EventManager.Domain.Entities
{
    public class EventTask
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public Guid? TaskId { get; set; }
        public Guid? StaffId { get; set; }
        public string Status { get; set; } = "Pending";
        public string? Note { get; set; }
        public Event? Event { get; set; }
        public TaskTemplate? Task { get; set; }
        public Staff? Staff { get; set; }
    }
}