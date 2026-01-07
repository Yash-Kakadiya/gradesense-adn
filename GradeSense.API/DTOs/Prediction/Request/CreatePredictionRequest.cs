namespace GradeSense.API.DTOs.Prediction.Request
{
    public class CreatePredictionRequest
    {
        public int CourseEnrollmentId { get; set; }
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
        public bool IsActive { get; set; } = true;
    }
}