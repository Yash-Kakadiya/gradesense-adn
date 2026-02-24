namespace GradeSense.API.DTOs.AttendanceRecord.Request
{
    /// <summary>
    /// Request model for bulk attendance marking
    /// </summary>
    public class BulkAttendanceRequest
    {
        /// <summary>
        /// Course offering ID for which attendance is being marked
        /// </summary>
        public int CourseOfferingId { get; set; }

        /// <summary>
        /// Date of attendance
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Faculty ID marking the attendance
        /// </summary>
        public int MarkedById { get; set; }

        /// <summary>
        /// List of attendance records
        /// </summary>
        public List<AttendanceEntry> Records { get; set; } = new();
    }

    /// <summary>
    /// Individual attendance entry in bulk request
    /// </summary>
    public class AttendanceEntry
    {
        /// <summary>
        /// Student ID
        /// </summary>
        public int StudentId { get; set; }

        /// <summary>
        /// Attendance status: Present, Absent, Late, Excused
        /// </summary>
        public string Status { get; set; } = "Present";

        /// <summary>
        /// Optional remarks
        /// </summary>
        public string? Remarks { get; set; }
    }

    /// <summary>
    /// Response model for bulk attendance marking
    /// </summary>
    public class BulkAttendanceResponse
    {
        public int TotalRequested { get; set; }
        public int SuccessfulEntries { get; set; }
        public int FailedEntries { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}
