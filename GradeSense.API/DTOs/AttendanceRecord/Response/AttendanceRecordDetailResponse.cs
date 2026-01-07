namespace GradeSense.API.DTOs.AttendanceRecord.Response
{
    public class AttendanceRecordDetailResponse
    {
        public int Id { get; set; }
        public int EnrollmentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;
        public int StudentId { get; set; }
        public int CourseOfferingId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string BatchName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public DateOnly AttendanceDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? RecordedBy { get; set; }
        public string? RecordedByName { get; set; }
        public string? RecordedByEmployeeId { get; set; }
        public string? Remarks { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}