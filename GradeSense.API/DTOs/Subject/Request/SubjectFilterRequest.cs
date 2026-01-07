namespace GradeSense.API.DTOs.Subject.Request
{
    public class SubjectFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? DepartmentId { get; set; }
        public int? Semester { get; set; }
        public string? SubjectType { get; set; }
        public bool? IsElective { get; set; }
        public bool? IsActive { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "Id";
        public string SortOrder { get; set; } = "asc";
    }
}