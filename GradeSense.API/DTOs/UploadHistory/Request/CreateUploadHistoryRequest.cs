namespace GradeSense.API.DTOs.UploadHistory.Request
{
    public class CreateUploadHistoryRequest
    {
        public int CourseOfferingId { get; set; }
        public int? AssessmentItemId { get; set; }
        public int UploadedBy { get; set; }
        public string FileName { get; set; } = string.Empty;
        public long? FileSize { get; set; }
        public int SuccessCount { get; set; } = 0;
        public int ErrorCount { get; set; } = 0;
        public int TotalCount { get; set; } = 0;
        public string? ErrorDetails { get; set; }
        public string? RowDataBlob { get; set; }
        public string Status { get; set; } = "Processing";
    }
}