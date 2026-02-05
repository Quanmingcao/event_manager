using Microsoft.EntityFrameworkCore;
using EventManager.Domain.Entities;
namespace EventManager.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        public DbSet<Event> Events { get; set; }
        public DbSet<Staff> Staff { get; set; }
        public DbSet<TaskTemplate> TaskTemplates { get; set; }
        public DbSet<EventTask> EventTasks { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<EventFinance> EventFinances { get; set; }
        public DbSet<EventStaff> EventStaff { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Events
            modelBuilder.Entity<Event>(entity =>
            {
                entity.ToTable("events");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name").IsRequired();
                entity.Property(e => e.Organizer).HasColumnName("organizer");
                entity.Property(e => e.StartDate).HasColumnName("start_date");
                entity.Property(e => e.Location).HasColumnName("location");
                entity.Property(e => e.Format).HasColumnName("format");
                entity.Property(e => e.ScriptLink).HasColumnName("script_link");
                entity.Property(e => e.TimelineLink).HasColumnName("timeline_link");
                entity.Property(e => e.Status).HasColumnName("status").HasDefaultValue("Planning");
                entity.Property(e => e.OutcomeSummary).HasColumnName("outcome_summary");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            });
            // Staff
            modelBuilder.Entity<Staff>(entity =>
            {
                entity.ToTable("staff");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.FullName).HasColumnName("full_name").IsRequired();
                entity.Property(e => e.StaffType).HasColumnName("staff_type");
                entity.Property(e => e.Phone).HasColumnName("phone");
                entity.Property(e => e.Department).HasColumnName("department");
            });
            // TaskTemplates
            modelBuilder.Entity<TaskTemplate>(entity =>
            {
                entity.ToTable("task_templates");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TaskName).HasColumnName("task_name").IsRequired();
                entity.Property(e => e.Description).HasColumnName("description");
            });
            // EventTasks
            modelBuilder.Entity<EventTask>(entity =>
            {
                entity.ToTable("event_tasks");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.EventId).HasColumnName("event_id");
                entity.Property(e => e.TaskId).HasColumnName("task_id");
                entity.Property(e => e.StaffId).HasColumnName("staff_id");
                entity.Property(e => e.Status).HasColumnName("status").HasDefaultValue("Pending");
                entity.Property(e => e.Note).HasColumnName("note");
                entity.HasOne(e => e.Event)
                    .WithMany(e => e.EventTasks)
                    .HasForeignKey(e => e.EventId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Task)
                    .WithMany(t => t.EventTasks)
                    .HasForeignKey(e => e.TaskId)
                    .OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.Staff)
                    .WithMany(s => s.EventTasks)
                    .HasForeignKey(e => e.StaffId)
                    .OnDelete(DeleteBehavior.SetNull);
            });
            // Services
            modelBuilder.Entity<Service>(entity =>
            {
                entity.ToTable("services");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ServiceName).HasColumnName("service_name").IsRequired();
                entity.Property(e => e.BasePrice).HasColumnName("base_price").HasDefaultValue(0);
            });
            // EventFinances
            modelBuilder.Entity<EventFinance>(entity =>
            {
                entity.ToTable("event_finances");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.EventId).HasColumnName("event_id");
                entity.Property(e => e.ServiceId).HasColumnName("service_id");
                entity.Property(e => e.ServiceName).HasColumnName("service_name");
                entity.Property(e => e.EstimatedAmount).HasColumnName("estimated_amount").HasDefaultValue(0);
                entity.Property(e => e.EstimatedNote).HasColumnName("estimated_note");
                entity.Property(e => e.ExtraAmount).HasColumnName("extra_amount").HasDefaultValue(0);
                entity.Property(e => e.ExtraNote).HasColumnName("extra_note");
                entity.Ignore(e => e.TotalAmount);
                entity.HasOne(e => e.Event)
                    .WithMany(e => e.EventFinances)
                    .HasForeignKey(e => e.EventId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(e => e.Service)
                    .WithMany(s => s.EventFinances)
                    .HasForeignKey(e => e.ServiceId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // EventStaff
            modelBuilder.Entity<EventStaff>(entity =>
            {
                entity.ToTable("event_staff");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.EventId).HasColumnName("event_id");
                entity.Property(e => e.FullName).HasColumnName("full_name").IsRequired();
                entity.Property(e => e.Phone).HasColumnName("phone");
                entity.Property(e => e.Department).HasColumnName("department");
                entity.Property(e => e.StaffType).HasColumnName("staff_type");
                entity.Property(e => e.AssignedTask).HasColumnName("assigned_task");
                entity.Property(e => e.Note).HasColumnName("note");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");

                entity.HasOne(e => e.Event)
                    .WithMany()
                    .HasForeignKey(e => e.EventId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Profiles
            modelBuilder.Entity<Profile>(entity =>
            {
                entity.ToTable("profiles");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.FullName).HasColumnName("full_name");
                entity.Property(e => e.Role).HasColumnName("role").HasDefaultValue("staff");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("now()");
            });
        }
    }
}