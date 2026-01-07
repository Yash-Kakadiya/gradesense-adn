namespace GradeSense.API.DTOs.Prediction.Request
{
    public class UpdatePredictionRequest
    {
        public string? PredictedCategory { get; set; }
        public decimal? RiskScore { get; set; }
        public decimal? ConfidenceScore { get; set; }
        public string? PredictedGrade { get; set; }
        public decimal? PredictedMarks { get; set; }
        public decimal? ModelAccuracy { get; set; }
        public string? FeatureImportance { get; set; }
        public string? ExplanationJson { get; set; }
        public string? RecommendedActions { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool? IsActive { get; set; }
        public int? ReviewedBy { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
    }
}