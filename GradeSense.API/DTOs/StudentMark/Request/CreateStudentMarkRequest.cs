namespace GradeSense.API.DTOs.StudentMark.Request
{
    public class CreateStudentMarkRequest
    {
        public int EnrollmentId { get; set; }
        public int AssessmentItemId { get; set; }
        public decimal? ObtainedMarks { get; set; }
        public bool IsAbsent { get; set; } = false;
        public string? Remarks { get; set; }
        public int GraderId { get; set; }
        public DateTime? GradedDate { get; set; }
        public DateTime? SubmissionDate { get; set; }
    }
}