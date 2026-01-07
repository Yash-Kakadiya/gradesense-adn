namespace GradeSense.API.DTOs.AuditLog.Response
{
    public class AuditLogResponse
    {
        public long Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public int ActorUserId { get; set; }
        public string ActorUserName { get; set; } = string.Empty;
        public string ActorUserEmail { get; set; } = string.Empty;
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
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}