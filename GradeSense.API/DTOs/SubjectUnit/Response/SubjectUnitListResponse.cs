namespace GradeSense.API.DTOs.SubjectUnit.Response
{
    public class SubjectUnitListResponse
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
        public DateTime? CreatedAt { get; set; }
    }
}