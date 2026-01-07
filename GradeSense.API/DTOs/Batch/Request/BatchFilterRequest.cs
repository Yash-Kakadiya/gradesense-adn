namespace GradeSense.API.DTOs.Batch.Request
{
    public class BatchFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? DepartmentId { get; set; }
        public int? Semester { get; set; }
        public int? AcademicYear { get; set; }
        public int? ClassCoordinatorId { get; set; }
        public bool? IsActive { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "Id";
        public string SortOrder { get; set; } = "asc";
    }
}