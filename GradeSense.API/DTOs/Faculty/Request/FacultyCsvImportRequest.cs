using CsvHelper.Configuration.Attributes;

namespace GradeSense.API.DTOs.Faculty.Request;

/// <summary>
/// CSV Import model for Faculty
/// Maps CSV columns to faculty properties
/// </summary>
public class FacultyCsvImportRequest
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

    [Name("EmployeeId")]
    [Index(5)]
    public string EmployeeId { get; set; } = string.Empty;

    [Name("DepartmentCode")]
    [Index(6)]
    public string DepartmentCode { get; set; } = string.Empty;

    [Name("Designation")]
    [Index(7)]
    public string Designation { get; set; } = "Assistant Professor";

    [Name("JoiningDate")]
    [Index(8)]
    [Optional]
    public string? JoiningDate { get; set; }

    [Name("Specialization")]
    [Index(9)]
    [Optional]
    public string? Specialization { get; set; }

    [Name("Status")]
    [Index(10)]
    public string Status { get; set; } = "Active";
}
