namespace GradeSense.API.DTOs.CourseEnrollment.Request
{
    public class CourseEnrollmentFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? CourseOfferingId { get; set; }
        public int? StudentId { get; set; }
        public int? SubjectId { get; set; }
        public int? BatchId { get; set; }
        public int? DepartmentId { get; set; }
        public string? Status { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "Id";
        public string SortOrder { get; set; } = "asc";
    }
}