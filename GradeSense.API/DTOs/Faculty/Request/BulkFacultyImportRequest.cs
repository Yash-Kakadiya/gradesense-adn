namespace GradeSense.API.DTOs.Faculty.Request;

/// <summary>
/// Request model for bulk faculty import with validation preview
/// </summary>
public class BulkFacultyImportRequest
{
    /// <summary>
    /// List of faculty entries from the import file
    /// </summary>
    public List<FacultyImportRow> Rows { get; set; } = new();

    /// <summary>
    /// How to handle conflicts (existing faculty with same email/employee ID)
    /// Options: Skip, Update, Error
    /// </summary>
    public string ConflictResolution { get; set; } = "Skip";
}

/// <summary>
/// Individual row from faculty import file
/// </summary>
public class FacultyImportRow
{
    /// <summary>
    /// Row number from the import file (for error reporting)
    /// </summary>
    public int RowNumber { get; set; }

    /// <summary>
    /// Faculty's personal email (primary login)
    /// </summary>
    public string PersonalEmail { get; set; } = string.Empty;

    /// <summary>
    /// Faculty's institutional email (optional)
    /// </summary>
    public string? InstitutionalEmail { get; set; }

    /// <summary>
    /// Faculty's phone number (optional)
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Faculty's full name
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Initial password for the faculty
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Unique employee ID
    /// </summary>
    public string EmployeeId { get; set; } = string.Empty;

    /// <summary>
    /// Department code (must exist)
    /// </summary>
    public string DepartmentCode { get; set; } = string.Empty;

    /// <summary>
    /// Designation (e.g., Professor, Associate Professor, Assistant Professor)
    /// </summary>
    public string Designation { get; set; } = string.Empty;

    /// <summary>
    /// Date of joining
    /// </summary>
    public DateOnly? JoiningDate { get; set; }

    /// <summary>
    /// Specialization areas
    /// </summary>
    public string? Specialization { get; set; }

    /// <summary>
    /// Faculty status: Active, OnLeave, Resigned, Retired
    /// </summary>
    public string Status { get; set; } = "Active";
}

/// <summary>
/// Response model for faculty import validation/preview
/// </summary>
public class BulkFacultyValidationResponse
{
    public int TotalRows { get; set; }
    public int ValidRows { get; set; }
    public int InvalidRows { get; set; }
    public int ConflictRows { get; set; }
    public List<FacultyValidationRow> Rows { get; set; } = new();
    public bool CanProceed => InvalidRows == 0;
    public string Summary => $"Total: {TotalRows}, Valid: {ValidRows}, Invalid: {InvalidRows}, Conflicts: {ConflictRows}";
}

/// <summary>
/// Validated faculty row with resolved info
/// </summary>
public class FacultyValidationRow
{
    public int RowNumber { get; set; }
    public string PersonalEmail { get; set; } = string.Empty;
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string DepartmentCode { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public DateOnly? JoiningDate { get; set; }
    public string? Specialization { get; set; }
    public string Status { get; set; } = string.Empty;

    // Resolved info
    public int? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }

    // Conflict info
    public int? ExistingFacultyId { get; set; }
    public string? ExistingFacultyName { get; set; }

    // Validation status
    public bool IsValid { get; set; }
    public bool HasConflict { get; set; }
    public List<string> Errors { get; set; } = new();
    public string ValidationStatus => IsValid ? (HasConflict ? "Conflict" : "Valid") : "Invalid";
}
