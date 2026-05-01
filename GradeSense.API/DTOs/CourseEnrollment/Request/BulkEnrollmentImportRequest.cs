namespace GradeSense.API.DTOs.CourseEnrollment.Request
{
    /// <summary>
    /// Request model for bulk enrollment import with validation preview
    /// </summary>
    public class BulkEnrollmentImportRequest
    {
        /// <summary>
        /// Course offering ID for which students are being enrolled
        /// </summary>
        public int CourseOfferingId { get; set; }

        /// <summary>
        /// List of enrollment entries from the import file
        /// </summary>
        public List<EnrollmentImportRow> Rows { get; set; } = new();

        /// <summary>
        /// How to handle conflicts (students already enrolled)
        /// Options: Skip, Update (re-activate), Error
        /// </summary>
        public string ConflictResolution { get; set; } = "Skip";
    }

    /// <summary>
    /// Individual row from enrollment import file
    /// </summary>
    public class EnrollmentImportRow
    {
        /// <summary>
        /// Row number from the import file (for error reporting)
        /// </summary>
        public int RowNumber { get; set; }

        /// <summary>
        /// Student roll number / enrollment number
        /// </summary>
        public string RollNumber { get; set; } = string.Empty;
    }

    /// <summary>
    /// Response model for enrollment import validation/preview
    /// </summary>
    public class BulkEnrollmentValidationResponse
    {
        public int TotalRows { get; set; }
        public int ValidRows { get; set; }
        public int InvalidRows { get; set; }
        public int ConflictRows { get; set; }
        public List<EnrollmentValidationRow> Rows { get; set; } = new();
        public bool CanProceed => InvalidRows == 0;
        public string Summary => $"Total: {TotalRows}, Valid: {ValidRows}, Invalid: {InvalidRows}, Conflicts: {ConflictRows}";
    }

    /// <summary>
    /// Validated enrollment row with resolved student info
    /// </summary>
    public class EnrollmentValidationRow
    {
        public int RowNumber { get; set; }
        public string RollNumber { get; set; } = string.Empty;

        // Resolved student info
        public int? StudentId { get; set; }
        public string? StudentName { get; set; }
        public string? StudentEmail { get; set; }
        public string? BatchName { get; set; }
        public string? DepartmentName { get; set; }

        // Conflict info
        public int? ExistingEnrollmentId { get; set; }
        public string? ExistingStatus { get; set; }

        // Validation status
        public bool IsValid { get; set; }
        public bool HasConflict { get; set; }
        public List<string> Errors { get; set; } = new();
        public string ValidationStatus => IsValid ? (HasConflict ? "Conflict" : "Valid") : "Invalid";
    }
}
