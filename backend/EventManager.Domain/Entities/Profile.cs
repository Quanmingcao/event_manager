using System;
namespace EventManager.Domain.Entities
{
    public class Profile
    {
        public Guid Id { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string Role { get; set; } = "staff";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}