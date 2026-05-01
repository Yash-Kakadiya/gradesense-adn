namespace GradeSense.API.DTOs.AttendanceRecord.Request
{
    /// <summary>
    /// Request model for bulk attendance import with validation preview
    /// </summary>
    public class BulkAttendanceImportRequest
    {
        /// <summary>
        /// Course offering ID for which attendance is being imported
        /// </summary>
        public int CourseOfferingId { get; set; }

        /// <summary>
        /// Date of attendance
        /// </summary>
        public DateOnly AttendanceDate { get; set; }

        /// <summary>
        /// ID of the faculty marking attendance
        /// </summary>
        public int MarkedById { get; set; }

        /// <summary>
        /// List of attendance entries from the import file
        /// </summary>
        public List<AttendanceImportRow> Rows { get; set; } = new();

        /// <summary>
        /// How to handle conflicts (existing attendance)
        /// Options: Skip, Update, Error
        /// </summary>
        public string ConflictResolution { get; set; } = "Update";
    }

    /// <summary>
    /// Individual row from attendance import file
    /// </summary>
    public class AttendanceImportRow
    {
        /// <summary>
        /// Row number from the import file (for error reporting)
        /// </summary>
        public int RowNumber { get; set; }

        /// <summary>
        /// Student roll number / enrollment number
        /// </summary>
        public string RollNumber { get; set; } = string.Empty;

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
    /// Response model for attendance import validation/preview
    /// </summary>
    public class BulkAttendanceValidationResponse
    {
        public int TotalRows { get; set; }
        public int ValidRows { get; set; }
        public int InvalidRows { get; set; }
        public int ConflictRows { get; set; }
        public List<AttendanceValidationRow> Rows { get; set; } = new();
        public bool CanProceed => InvalidRows == 0;
        public string Summary => $"Total: {TotalRows}, Valid: {ValidRows}, Invalid: {InvalidRows}, Conflicts: {ConflictRows}";
    }

    /// <summary>
    /// Validated attendance row with resolved student info
    /// </summary>
    public class AttendanceValidationRow
    {
        public int RowNumber { get; set; }
        public string RollNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Remarks { get; set; }

        // Resolved info
        public int? StudentId { get; set; }
        public int? EnrollmentId { get; set; }
        public string? StudentName { get; set; }
        public string? ExistingStatus { get; set; }

        // Validation status
        public bool IsValid { get; set; }
        public bool HasConflict { get; set; }
        public List<string> Errors { get; set; } = new();
        public string ValidationStatus => IsValid ? (HasConflict ? "Conflict" : "Valid") : "Invalid";
    }
}
