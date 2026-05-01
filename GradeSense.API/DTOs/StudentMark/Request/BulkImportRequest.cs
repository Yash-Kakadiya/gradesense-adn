namespace GradeSense.API.DTOs.StudentMark.Request
{
    /// <summary>
    /// Request model for bulk grade import with validation preview
    /// </summary>
    public class BulkGradeImportRequest
    {
        /// <summary>
        /// Assessment item ID for which grades are being imported
        /// </summary>
        public int AssessmentItemId { get; set; }

        /// <summary>
        /// ID of the faculty member grading
        /// </summary>
        public int GraderId { get; set; }

        /// <summary>
        /// List of grade entries from the import file
        /// </summary>
        public List<GradeImportRow> Rows { get; set; } = new();

        /// <summary>
        /// How to handle conflicts (existing grades)
        /// Options: Skip, Update, Error
        /// </summary>
        public string ConflictResolution { get; set; } = "Skip";
    }

    /// <summary>
    /// Individual row from import file
    /// </summary>
    public class GradeImportRow
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
        /// Marks obtained (as string to preserve raw input)
        /// </summary>
        public string MarksObtained { get; set; } = string.Empty;

        /// <summary>
        /// Whether student was absent
        /// </summary>
        public bool IsAbsent { get; set; }

        /// <summary>
        /// Optional remarks
        /// </summary>
        public string? Remarks { get; set; }
    }

    /// <summary>
    /// Response model for grade import validation/preview
    /// </summary>
    public class BulkGradeValidationResponse
    {
        public int TotalRows { get; set; }
        public int ValidRows { get; set; }
        public int InvalidRows { get; set; }
        public int ConflictRows { get; set; }
        public List<GradeValidationRow> Rows { get; set; } = new();
        public bool CanProceed => InvalidRows == 0;
        public string Summary => $"Total: {TotalRows}, Valid: {ValidRows}, Invalid: {InvalidRows}, Conflicts: {ConflictRows}";
    }

    /// <summary>
    /// Validated row with resolved student info
    /// </summary>
    public class GradeValidationRow
    {
        public int RowNumber { get; set; }
        public string RollNumber { get; set; } = string.Empty;
        public decimal? MarksObtained { get; set; }
        public bool IsAbsent { get; set; }
        public string? Remarks { get; set; }

        // Resolved info
        public int? StudentId { get; set; }
        public int? EnrollmentId { get; set; }
        public string? StudentName { get; set; }
        public decimal? ExistingMarks { get; set; }

        // Validation status
        public bool IsValid { get; set; }
        public bool HasConflict { get; set; }
        public List<string> Errors { get; set; } = new();
        public string Status => IsValid ? (HasConflict ? "Conflict" : "Valid") : "Invalid";
    }
}
