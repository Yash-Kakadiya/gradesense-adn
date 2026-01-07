namespace GradeSense.API.DTOs.AssessmentItem.Response
{
    public class AssessmentItemResponse
    {
        public int Id { get; set; }
        public int EvaluationSchemeId { get; set; }
        public string EvaluationSchemeName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public int? SubjectUnitId { get; set; }
        public string? SubjectUnitTopicName { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal MaxMarks { get; set; }
        public string CalculationType { get; set; } = string.Empty;
        public decimal? Weight { get; set; }
        public DateOnly? ScheduledDate { get; set; }
        public DateOnly? DueDate { get; set; }
        public int? CreatedBy { get; set; }
        public string? CreatedByName { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}