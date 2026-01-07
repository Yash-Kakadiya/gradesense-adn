namespace GradeSense.API.DTOs.EvaluationScheme.Request
{
    public class UpdateEvaluationSchemeRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal? TotalMarks { get; set; }
        public decimal? PassingMarks { get; set; }
        public decimal? Weight { get; set; }
        public string? EvaluationType { get; set; }
        public bool? IsActive { get; set; }
    }
}