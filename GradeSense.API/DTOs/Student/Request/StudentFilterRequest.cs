namespace GradeSense.API.DTOs.Student.Request
{
    public class StudentFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? DepartmentId { get; set; }
        public string? Status { get; set; }
        public int? AdmissionYear { get; set; }
        public int? CurrentSemester { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "Id";
        public string SortOrder { get; set; } = "asc";
    }
}