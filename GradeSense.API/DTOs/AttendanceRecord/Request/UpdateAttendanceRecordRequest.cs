namespace GradeSense.API.DTOs.AttendanceRecord.Request
{
    public class UpdateAttendanceRecordRequest
    {
        public DateOnly? AttendanceDate { get; set; }
        public string? Status { get; set; }
        public int? RecordedBy { get; set; }
        public string? Remarks { get; set; }
    }
}