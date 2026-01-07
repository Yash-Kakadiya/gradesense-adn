namespace GradeSense.API.DTOs.AuditLog.Request
{
    public class AuditLogFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? ActorUserId { get; set; }
        public string? EntityName { get; set; }
        public string? EntityId { get; set; }
        public string? Action { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? IPAddress { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50; // Higher default for logs
        public string SortBy { get; set; } = "OccurredAt";
        public string SortOrder { get; set; } = "desc"; // Most recent first
    }
}