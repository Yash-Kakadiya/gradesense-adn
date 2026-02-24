namespace GradeSense.API.DTOs.StudentMark.Request
{
    /// <summary>
    /// Request model for bulk student marks entry
    /// </summary>
    public class BulkStudentMarkRequest
    {
        /// <summary>
        /// Assessment item ID for which marks are being entered
        /// </summary>
        public int AssessmentItemId { get; set; }

        /// <summary>
        /// ID of the faculty member grading the marks
        /// </summary>
        public int GraderId { get; set; }

        /// <summary>
        /// List of mark entries
        /// </summary>
        public List<StudentMarkEntry> Marks { get; set; } = new();
    }

    /// <summary>
    /// Individual mark entry in bulk request
    /// </summary>
    public class StudentMarkEntry
    {
        /// <summary>
        /// Student ID
        /// </summary>
        public int StudentId { get; set; }

        /// <summary>
        /// Marks obtained by the student
        /// </summary>
        public decimal MarksObtained { get; set; }

        /// <summary>
        /// Whether the student was absent
        /// </summary>
        public bool IsAbsent { get; set; } = false;

        /// <summary>
        /// Optional remarks
        /// </summary>
        public string? Remarks { get; set; }
    }

    /// <summary>
    /// Response model for bulk student marks entry
    /// </summary>
    public class BulkStudentMarkResponse
    {
        public int TotalRequested { get; set; }
        public int SuccessfulEntries { get; set; }
        public int FailedEntries { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}
