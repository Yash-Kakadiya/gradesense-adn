namespace GradeSense.API.DTOs.Faculty.Request
{
    public class FacultyFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? DepartmentId { get; set; }
        public string? Designation { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "Id";
        public string SortOrder { get; set; } = "asc";
    }
}
