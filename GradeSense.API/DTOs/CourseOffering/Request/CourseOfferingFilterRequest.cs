namespace GradeSense.API.DTOs.CourseOffering.Request
{
    public class CourseOfferingFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? SubjectId { get; set; }
        public int? BatchId { get; set; }
        public int? DepartmentId { get; set; }
        public int? SubjectCoordinatorId { get; set; }
        public int? AcademicYear { get; set; }
        public bool? IsActive { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "Id";
        public string SortOrder { get; set; } = "asc";
    }
}