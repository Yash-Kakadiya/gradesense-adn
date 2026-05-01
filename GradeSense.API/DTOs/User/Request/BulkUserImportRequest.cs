namespace GradeSense.API.DTOs.User.Request;

/// <summary>
/// Request model for bulk user import with validation preview
/// </summary>
public class BulkUserImportRequest
{
    /// <summary>
    /// List of user entries from the import file
    /// </summary>
    public List<UserImportRow> Rows { get; set; } = new();

    /// <summary>
    /// How to handle conflicts (existing users with same email)
    /// Options: Skip, Update, Error
    /// </summary>
    public string ConflictResolution { get; set; } = "Skip";
}

/// <summary>
/// Individual row from user import file
/// </summary>
public class UserImportRow
{
    /// <summary>
    /// Row number from the import file (for error reporting)
    /// </summary>
    public int RowNumber { get; set; }

    /// <summary>
    /// User's personal email (primary login)
    /// </summary>
    public string PersonalEmail { get; set; } = string.Empty;

    /// <summary>
    /// User's institutional email (optional)
    /// </summary>
    public string? InstitutionalEmail { get; set; }

    /// <summary>
    /// User's phone number (optional)
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// User's full name
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Initial password for the user
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// User role: Admin, Faculty, Student
    /// </summary>
    public string Role { get; set; } = "Student";

    /// <summary>
    /// Whether user is active
    /// </summary>
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Response model for user import validation/preview
/// </summary>
public class BulkUserValidationResponse
{
    public int TotalRows { get; set; }
    public int ValidRows { get; set; }
    public int InvalidRows { get; set; }
    public int ConflictRows { get; set; }
    public List<UserValidationRow> Rows { get; set; } = new();
    public bool CanProceed => InvalidRows == 0;
    public string Summary => $"Total: {TotalRows}, Valid: {ValidRows}, Invalid: {InvalidRows}, Conflicts: {ConflictRows}";
}

/// <summary>
/// Validated user row with resolved info
/// </summary>
public class UserValidationRow
{
    public int RowNumber { get; set; }
    public string PersonalEmail { get; set; } = string.Empty;
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }

    // Conflict info
    public int? ExistingUserId { get; set; }
    public string? ExistingUserName { get; set; }

    // Validation status
    public bool IsValid { get; set; }
    public bool HasConflict { get; set; }
    public List<string> Errors { get; set; } = new();
    public string ValidationStatus => IsValid ? (HasConflict ? "Conflict" : "Valid") : "Invalid";
}
