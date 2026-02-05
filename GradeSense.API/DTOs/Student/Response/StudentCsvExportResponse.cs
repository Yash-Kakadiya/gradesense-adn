using CsvHelper.Configuration.Attributes;

namespace GradeSense.API.DTOs.Student.Response;

/// <summary>
/// CSV Export model for Students
/// </summary>
public class StudentCsvExportResponse
{
    [Name("Id")]
    [Index(0)]
    public int Id { get; set; }

    [Name("PersonalEmail")]
    [Index(1)]
    public string PersonalEmail { get; set; } = string.Empty;

    [Name("InstitutionalEmail")]
    [Index(2)]
    public string? InstitutionalEmail { get; set; }

    [Name("PhoneNumber")]
    [Index(3)]
    public string? PhoneNumber { get; set; }

    [Name("FullName")]
    [Index(4)]
    public string FullName { get; set; } = string.Empty;

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

    [Name("DepartmentName")]
    [Index(9)]
    public string DepartmentName { get; set; } = string.Empty;

    [Name("Status")]
    [Index(10)]
    public string Status { get; set; } = string.Empty;

    [Name("CGPA")]
    [Index(11)]
    public decimal? CGPA { get; set; }

    [Name("IsActive")]
    [Index(12)]
    public bool IsActive { get; set; }

    [Name("CreatedAt")]
    [Index(13)]
    public DateTime? CreatedAt { get; set; }
}
