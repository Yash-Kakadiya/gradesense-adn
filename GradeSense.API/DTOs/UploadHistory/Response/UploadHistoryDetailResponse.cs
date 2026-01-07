namespace GradeSense.API.DTOs.UploadHistory.Response
{
    public class UploadHistoryDetailResponse
    {
        public string Id { get; set; } = string.Empty;
        public int CourseOfferingId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public decimal SubjectCredit { get; set; }
        public string BatchName { get; set; } = string.Empty;
        public int BatchSemester { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int AcademicYear { get; set; }
        public int? AssessmentItemId { get; set; }
        public string? AssessmentItemName { get; set; }
        public int UploadedBy { get; set; }
        public string UploadedByName { get; set; } = string.Empty;
        public string UploadedByEmployeeId { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public long? FileSize { get; set; }
        public int SuccessCount { get; set; }
        public int ErrorCount { get; set; }
        public int TotalCount { get; set; }
        public string? ErrorDetails { get; set; }
        public string? RowDataBlob { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? UploadedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}