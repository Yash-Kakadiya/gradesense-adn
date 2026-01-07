namespace GradeSense.API.DTOs.EvaluationScheme.Response
{
    public class EvaluationSchemeDetailResponse
    {
        public int Id { get; set; }
        public int CourseOfferingId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public decimal SubjectCredit { get; set; }
        public string BatchName { get; set; } = string.Empty;
        public int BatchSemester { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int AcademicYear { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal TotalMarks { get; set; }
        public decimal PassingMarks { get; set; }
        public decimal Weight { get; set; }
        public string? EvaluationType { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Statistics
        public int AssessmentItemsCount { get; set; }
    }
}