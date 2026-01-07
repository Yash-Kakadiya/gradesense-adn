namespace GradeSense.API.DTOs.Prediction.Response
{
    public class PredictionDetailResponse
    {
        public string Id { get; set; } = string.Empty;
        public int CourseEnrollmentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string BatchName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string PredictedCategory { get; set; } = string.Empty;
        public decimal RiskScore { get; set; }
        public decimal? ConfidenceScore { get; set; }
        public string? PredictedGrade { get; set; }
        public decimal? PredictedMarks { get; set; }
        public string ModelVersion { get; set; } = string.Empty;
        public decimal? ModelAccuracy { get; set; }
        public string? FeatureImportance { get; set; }
        public string? ExplanationJson { get; set; }
        public string? RecommendedActions { get; set; }
        public DateTime? GeneratedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; }
        public int? ReviewedBy { get; set; }
        public string? ReviewedByName { get; set; }
        public string? ReviewedByEmail { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}