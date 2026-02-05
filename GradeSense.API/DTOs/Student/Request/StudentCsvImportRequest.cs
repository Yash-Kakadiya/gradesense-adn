using CsvHelper.Configuration.Attributes;

namespace GradeSense.API.DTOs.Student.Request;

/// <summary>
/// CSV Import model for Students
/// Maps CSV columns to student properties
/// </summary>
public class StudentCsvImportRequest
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

    [Name("EnrollmentNumber")]
    [Index(5)]
    public string EnrollmentNumber { get; set; } = string.Empty;

    [Name("AdmissionYear")]
    [Index(6)]
    public int AdmissionYear { get; set; }

    [Name("CurrentSemester")]
    [Index(7)]
    public int CurrentSemester { get; set; }

    [Name("DepartmentCode")]
    [Index(8)]
    public string DepartmentCode { get; set; } = string.Empty;

    [Name("Status")]
    [Index(9)]
    [Optional]
    public string Status { get; set; } = "Active";

    [Name("CGPA")]
    [Index(10)]
    [Optional]
    public decimal? CGPA { get; set; }
}

/// <summary>
/// Export filter for students CSV
/// </summary>
public class StudentExportFilterRequest
{
    public int? DepartmentId { get; set; }
    public string? Status { get; set; }
    public int? AdmissionYear { get; set; }
    public int? CurrentSemester { get; set; }
}
