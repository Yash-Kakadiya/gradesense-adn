namespace GradeSense.API.DTOs.StudentMark.Request
{
    public class StudentMarkFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? EnrollmentId { get; set; }
        public int? StudentId { get; set; }
        public int? AssessmentItemId { get; set; }
        public int? EvaluationSchemeId { get; set; }
        public int? CourseOfferingId { get; set; }
        public int? SubjectId { get; set; }
        public int? GraderId { get; set; }
        public bool? IsAbsent { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "Id";
        public string SortOrder { get; set; } = "asc";
    }
}