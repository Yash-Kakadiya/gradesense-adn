namespace GradeSense.API.DTOs.AssessmentItem.Request
{
    public class CreateAssessmentItemRequest
    {
        public int EvaluationSchemeId { get; set; }
        public int? SubjectUnitId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal MaxMarks { get; set; }
        public string CalculationType { get; set; } = "Raw";
        public decimal? Weight { get; set; }
        public DateOnly? ScheduledDate { get; set; }
        public DateOnly? DueDate { get; set; }
        public int? CreatedBy { get; set; }
        public bool IsActive { get; set; } = true;
    }
}