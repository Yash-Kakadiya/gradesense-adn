namespace GradeSense.API.DTOs.AssessmentItem.Response
{
    public class AssessmentItemListResponse
    {
        public int Id { get; set; }
        public string EvaluationSchemeName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal MaxMarks { get; set; }
        public string CalculationType { get; set; } = string.Empty;
        public DateOnly? ScheduledDate { get; set; }
        public DateOnly? DueDate { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}