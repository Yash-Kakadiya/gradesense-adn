namespace GradeSense.API.DTOs.AttendanceRecord.Response
{
    public class AttendanceRecordListResponse
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int EnrollmentId { get; set; }
        public int CourseOfferingId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string SubjectCode { get; set; } = string.Empty;
        public DateOnly AttendanceDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? RecordedByName { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}