namespace GradeSense.API.DTOs.StudentMark.Request
{
    public class UpdateStudentMarkRequest
    {
        public decimal? ObtainedMarks { get; set; }
        public bool? IsAbsent { get; set; }
        public string? Remarks { get; set; }
        public int? GraderId { get; set; }
        public DateTime? GradedDate { get; set; }
        public DateTime? SubmissionDate { get; set; }
    }
}