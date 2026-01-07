namespace GradeSense.API.DTOs.FacultyAssignment.Request
{
    public class FacultyAssignmentFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? CourseOfferingId { get; set; }
        public int? FacultyId { get; set; }
        public int? SubjectId { get; set; }
        public int? BatchId { get; set; }
        public int? DepartmentId { get; set; }
        public string? Role { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "Id";
        public string SortOrder { get; set; } = "asc";
    }
}