using System;
namespace EventManager.Domain.Entities
{
    public class EventFinance
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public Guid? ServiceId { get; set; }
        public string? ServiceName { get; set; }
        public decimal EstimatedAmount { get; set; } = 0;
        public string? EstimatedNote { get; set; }
        public decimal ExtraAmount { get; set; } = 0;
        public string? ExtraNote { get; set; }
        public decimal TotalAmount => EstimatedAmount + ExtraAmount;
        public Event? Event { get; set; }
        public Service? Service { get; set; }
    }
}