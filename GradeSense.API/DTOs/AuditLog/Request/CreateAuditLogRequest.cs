namespace GradeSense.API.DTOs.AuditLog.Request
{
    public class CreateAuditLogRequest
    {
        public string Action { get; set; } = string.Empty;
        public int ActorUserId { get; set; }
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? ChangedFields { get; set; }
        public DateTime? OccurredAt { get; set; }
        public string? IPAddress { get; set; }
        public string? UserAgent { get; set; }
        public string? SessionId { get; set; }
        public string? Reason { get; set; }
    }
}