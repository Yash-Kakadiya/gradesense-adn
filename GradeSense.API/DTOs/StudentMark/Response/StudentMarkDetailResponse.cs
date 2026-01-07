namespace GradeSense.API.DTOs.StudentMark.Response
{
    public class StudentMarkDetailResponse
    {
        public int Id { get; set; }
        public int EnrollmentId { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;
        public int AssessmentItemId { get; set; }
        public string AssessmentItemName { get; set; } = string.Empty;
        public string AssessmentCalculationType { get; set; } = string.Empty;
        public decimal AssessmentMaxMarks { get; set; }
        public string EvaluationSchemeName { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string BatchName { get; set; } = string.Empty;
        public decimal? ObtainedMarks { get; set; }
        public bool IsAbsent { get; set; }
        public string? Remarks { get; set; }
        public int GraderId { get; set; }
        public string GraderName { get; set; } = string.Empty;
        public string GraderEmployeeId { get; set; } = string.Empty;
        public DateTime? GradedDate { get; set; }
        public DateTime? SubmissionDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Calculated fields
        public decimal? Percentage { get; set; }
    }
}