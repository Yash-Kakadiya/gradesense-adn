namespace GradeSense.API.DTOs.SubjectUnit.Request
{
    public class CreateSubjectUnitRequest
    {
        public int SubjectId { get; set; }
        public int UnitNumber { get; set; }
        public string TopicName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TeachingHours { get; set; }
        public decimal? Weightage { get; set; }
        public string? LearningOutcomes { get; set; }
    }
}