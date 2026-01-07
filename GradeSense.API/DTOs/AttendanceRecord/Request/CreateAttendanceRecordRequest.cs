namespace GradeSense.API.DTOs.AttendanceRecord.Request
{
    public class CreateAttendanceRecordRequest
    {
        public int EnrollmentId { get; set; }
        public DateOnly AttendanceDate { get; set; }
        public string Status { get; set; } = "Present";
        public int? RecordedBy { get; set; }
        public string? Remarks { get; set; }
    }
}