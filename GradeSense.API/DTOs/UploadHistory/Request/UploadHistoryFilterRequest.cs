namespace GradeSense.API.DTOs.UploadHistory.Request
{
    public class UploadHistoryFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? CourseOfferingId { get; set; }
        public int? AssessmentItemId { get; set; }
        public int? UploadedBy { get; set; }
        public int? SubjectId { get; set; }
        public int? BatchId { get; set; }
        public string? Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "UploadedAt";
        public string SortOrder { get; set; } = "desc";
    }
}