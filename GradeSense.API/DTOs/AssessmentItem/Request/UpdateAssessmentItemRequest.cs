namespace GradeSense.API.DTOs.AssessmentItem.Request
{
    public class UpdateAssessmentItemRequest
    {
        public int? SubjectUnitId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal? MaxMarks { get; set; }
        public string? CalculationType { get; set; }
        public decimal? Weight { get; set; }
        public DateOnly? ScheduledDate { get; set; }
        public DateOnly? DueDate { get; set; }
        public bool? IsActive { get; set; }
    }
}