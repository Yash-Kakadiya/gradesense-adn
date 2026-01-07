namespace GradeSense.API.DTOs.UploadHistory.Response
{
    public class UploadHistoryListResponse
    {
        public string Id { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string BatchName { get; set; } = string.Empty;
        public string? AssessmentItemName { get; set; }
        public string UploadedByName { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public int SuccessCount { get; set; }
        public int ErrorCount { get; set; }
        public int TotalCount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? UploadedAt { get; set; }
    }
}