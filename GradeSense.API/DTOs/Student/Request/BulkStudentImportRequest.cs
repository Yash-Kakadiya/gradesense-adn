namespace GradeSense.API.DTOs.Student.Request;

/// <summary>
/// Request model for bulk student import with validation preview
/// </summary>
public class BulkStudentImportRequest
{
    /// <summary>
    /// List of student entries from the import file
    /// </summary>
    public List<StudentImportRow> Rows { get; set; } = new();

    /// <summary>
    /// How to handle conflicts (existing students with same email/enrollment)
    /// Options: Skip, Update, Error
    /// </summary>
    public string ConflictResolution { get; set; } = "Skip";
}

/// <summary>
/// Individual row from student import file
/// </summary>
public class StudentImportRow
{
    /// <summary>
    /// Row number from the import file (for error reporting)
    /// </summary>
    public int RowNumber { get; set; }

    /// <summary>
    /// Student's personal email (primary login)
    /// </summary>
    public string PersonalEmail { get; set; } = string.Empty;

    /// <summary>
    /// Student's institutional email (optional)
    /// </summary>
    public string? InstitutionalEmail { get; set; }

    /// <summary>
    /// Student's phone number (optional)
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Student's full name
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Initial password for the student
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Unique enrollment number
    /// </summary>
    public string EnrollmentNumber { get; set; } = string.Empty;

    /// <summary>
    /// Year of admission
    /// </summary>
    public int AdmissionYear { get; set; }

    /// <summary>
    /// Current semester (1-8)
    /// </summary>
    public int CurrentSemester { get; set; }

    /// <summary>
    /// Department code (must exist)
    /// </summary>
    public string DepartmentCode { get; set; } = string.Empty;

    /// <summary>
    /// Batch name (optional, must exist if provided)
    /// </summary>
    public string? BatchName { get; set; }

    /// <summary>
    /// Student status: Active, Graduated, Withdrawn, Suspended
    /// </summary>
    public string Status { get; set; } = "Active";
}

/// <summary>
/// Response model for student import validation/preview
/// </summary>
public class BulkStudentValidationResponse
{
    public int TotalRows { get; set; }
    public int ValidRows { get; set; }
    public int InvalidRows { get; set; }
    public int ConflictRows { get; set; }
    public List<StudentValidationRow> Rows { get; set; } = new();
    public bool CanProceed => InvalidRows == 0;
    public string Summary => $"Total: {TotalRows}, Valid: {ValidRows}, Invalid: {InvalidRows}, Conflicts: {ConflictRows}";
}

/// <summary>
/// Validated student row with resolved info
/// </summary>
public class StudentValidationRow
{
    public int RowNumber { get; set; }
    public string PersonalEmail { get; set; } = string.Empty;
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string EnrollmentNumber { get; set; } = string.Empty;
    public int AdmissionYear { get; set; }
    public int CurrentSemester { get; set; }
    public string DepartmentCode { get; set; } = string.Empty;
    public string? BatchName { get; set; }
    public string Status { get; set; } = string.Empty;

    // Resolved info
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int? BatchId { get; set; }

    // Conflict info
    public int? ExistingStudentId { get; set; }
    public string? ExistingStudentName { get; set; }

    // Validation status
    public bool IsValid { get; set; }
    public bool HasConflict { get; set; }
    public List<string> Errors { get; set; } = new();
    public string ValidationStatus => IsValid ? (HasConflict ? "Conflict" : "Valid") : "Invalid";
}
