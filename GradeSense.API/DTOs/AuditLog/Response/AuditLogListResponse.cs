namespace GradeSense.API.DTOs.AuditLog.Response
{
    public class AuditLogListResponse
    {
        public long Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string ActorUserName { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string? ChangedFields { get; set; }
        public DateTime? OccurredAt { get; set; }
        public string? IPAddress { get; set; }
    }
}