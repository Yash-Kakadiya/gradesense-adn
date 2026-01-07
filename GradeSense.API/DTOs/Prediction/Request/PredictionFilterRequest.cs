namespace GradeSense.API.DTOs.Prediction.Request
{
    public class PredictionFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? CourseEnrollmentId { get; set; }
        public int? StudentId { get; set; }
        public int? CourseOfferingId { get; set; }
        public string? PredictedCategory { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsExpired { get; set; }
        public bool? IsReviewed { get; set; }
        public int? ReviewedBy { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "GeneratedAt";
        public string SortOrder { get; set; } = "desc";
    }
}