namespace GradeSense.API.DTOs.SubjectUnit.Response
{
    public class SubjectUnitDetailResponse
    {
        public int Id { get; set; }
        public int SubjectId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public int UnitNumber { get; set; }
        public string TopicName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TeachingHours { get; set; }
        public decimal? Weightage { get; set; }
        public string? LearningOutcomes { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Statistics
        public int AssessmentItemsCount { get; set; }
    }
}