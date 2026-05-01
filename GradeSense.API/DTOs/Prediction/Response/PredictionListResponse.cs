namespace GradeSense.API.DTOs.Prediction.Response
{
    public class PredictionListResponse
    {
        public string Id { get; set; } = string.Empty;
        public int CourseEnrollmentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string PredictedCategory { get; set; } = string.Empty;
        public decimal RiskScore { get; set; }
        public decimal? ConfidenceScore { get; set; }
        public string? PredictedGrade { get; set; }
        public string? RecommendedActions { get; set; }
        public bool IsActive { get; set; }
        public bool IsExpired { get; set; }
        public DateTime? GeneratedAt { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}