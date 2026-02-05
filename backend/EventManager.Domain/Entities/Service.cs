using System;
using System.Collections.Generic;
namespace EventManager.Domain.Entities
{
    public class Service
    {
        public Guid Id { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public decimal BasePrice { get; set; } = 0;
        public ICollection<EventFinance> EventFinances { get; set; } = new List<EventFinance>();
    }
}
