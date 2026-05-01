using CsvHelper.Configuration.Attributes;

namespace GradeSense.API.DTOs.User.Request;

/// <summary>
/// CSV Import model for Users
/// Maps CSV columns to user properties
/// </summary>
public class UserCsvImportRequest
{
    [Name("PersonalEmail")]
    [Index(0)]
    public string PersonalEmail { get; set; } = string.Empty;

    [Name("InstitutionalEmail")]
    [Index(1)]
    [Optional]
    public string? InstitutionalEmail { get; set; }

    [Name("PhoneNumber")]
    [Index(2)]
    [Optional]
    public string? PhoneNumber { get; set; }

    [Name("FullName")]
    [Index(3)]
    public string FullName { get; set; } = string.Empty;

    [Name("Password")]
    [Index(4)]
    public string Password { get; set; } = string.Empty;

    [Name("Role")]
    [Index(5)]
    public string Role { get; set; } = "Student";

    [Name("IsActive")]
    [Index(6)]
    [BooleanTrueValues("true", "yes", "1", "y", "active")]
    [BooleanFalseValues("false", "no", "0", "n", "inactive")]
    public bool IsActive { get; set; } = true;
}
