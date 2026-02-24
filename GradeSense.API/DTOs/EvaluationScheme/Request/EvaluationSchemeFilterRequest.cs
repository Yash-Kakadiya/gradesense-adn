namespace GradeSense.API.DTOs.EvaluationScheme.Request
{
    public class EvaluationSchemeFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? CourseOfferingId { get; set; }
        /// <summary>
        /// Comma-separated list of course offering IDs for filtering multiple courses
        /// </summary>
        public string? CourseOfferingIds { get; set; }
        public int? SubjectId { get; set; }
        public int? BatchId { get; set; }
        public string? EvaluationType { get; set; }
        public bool? IsActive { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "Id";
        public string SortOrder { get; set; } = "asc";
    }
}