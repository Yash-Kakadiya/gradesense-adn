namespace GradeSense.API.DTOs.UploadHistory.Request
{
    public class UpdateUploadHistoryRequest
    {
        public int? SuccessCount { get; set; }
        public int? ErrorCount { get; set; }
        public int? TotalCount { get; set; }
        public string? ErrorDetails { get; set; }
        public string? RowDataBlob { get; set; }
        public string? Status { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}