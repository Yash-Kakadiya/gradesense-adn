namespace GradeSense.API.DTOs.EvaluationScheme.Request
{
    public class CreateEvaluationSchemeRequest
    {
        public int CourseOfferingId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal TotalMarks { get; set; }
        public decimal PassingMarks { get; set; }
        public decimal Weight { get; set; }
        public string? EvaluationType { get; set; }
        public bool IsActive { get; set; } = true;
    }
}