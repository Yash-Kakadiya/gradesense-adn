namespace GradeSense.API.DTOs.SubjectUnit.Request
{
    public class SubjectUnitFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? SubjectId { get; set; }
        public int? UnitNumber { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "UnitNumber";
        public string SortOrder { get; set; } = "asc";
    }
}