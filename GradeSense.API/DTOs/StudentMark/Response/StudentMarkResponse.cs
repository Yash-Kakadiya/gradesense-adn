namespace GradeSense.API.DTOs.StudentMark.Response
{
    public class StudentMarkResponse
    {
        public int Id { get; set; }
        public int EnrollmentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string EnrollmentNumber { get; set; } = string.Empty;
        public int AssessmentItemId { get; set; }
        public string AssessmentItemName { get; set; } = string.Empty;
        public decimal AssessmentMaxMarks { get; set; }
        public decimal? ObtainedMarks { get; set; }
        public bool IsAbsent { get; set; }
        public string? Remarks { get; set; }
        public int GraderId { get; set; }
        public string GraderName { get; set; } = string.Empty;
        public DateTime? GradedDate { get; set; }
        public DateTime? SubmissionDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}