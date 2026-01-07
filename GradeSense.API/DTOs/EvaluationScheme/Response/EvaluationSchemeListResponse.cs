namespace GradeSense.API.DTOs.EvaluationScheme.Response
{
    public class EvaluationSchemeListResponse
    {
        public int Id { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string BatchName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal TotalMarks { get; set; }
        public decimal PassingMarks { get; set; }
        public decimal Weight { get; set; }
        public string? EvaluationType { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}