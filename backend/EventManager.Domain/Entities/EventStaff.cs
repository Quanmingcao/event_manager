namespace EventManager.Domain.Entities
{
    public class EventStaff
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Department { get; set; }
        public string? StaffType { get; set; }
        public string? AssignedTask { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public Event? Event { get; set; }
    }
}
