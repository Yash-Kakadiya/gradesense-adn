namespace GradeSense.API.DTOs.AssessmentItem.Request
{
    public class AssessmentItemFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? EvaluationSchemeId { get; set; }
        public int? CourseOfferingId { get; set; }
        public int? SubjectId { get; set; }
        public int? SubjectUnitId { get; set; }
        public string? CalculationType { get; set; }
        public int? CreatedBy { get; set; }
        public bool? IsActive { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "Id";
        public string SortOrder { get; set; } = "asc";
    }
}