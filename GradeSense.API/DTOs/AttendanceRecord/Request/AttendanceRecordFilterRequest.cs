namespace GradeSense.API.DTOs.AttendanceRecord.Request
{
    public class AttendanceRecordFilterRequest
    {
        public string? SearchTerm { get; set; }
        public int? EnrollmentId { get; set; }
        public int? StudentId { get; set; }
        public int? CourseOfferingId { get; set; }
        public int? SubjectId { get; set; }
        public int? BatchId { get; set; }
        public string? Status { get; set; }
        public DateOnly? FromDate { get; set; }
        public DateOnly? ToDate { get; set; }
        public int? RecordedBy { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "AttendanceDate";
        public string SortOrder { get; set; } = "desc";
    }
}