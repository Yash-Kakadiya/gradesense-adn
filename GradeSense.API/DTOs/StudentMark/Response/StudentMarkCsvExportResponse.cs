using CsvHelper.Configuration.Attributes;

namespace GradeSense.API.DTOs.StudentMark.Response;

/// <summary>
/// CSV Export model for Student Marks (Grades)
/// </summary>
public class StudentMarkCsvExportResponse
{
    [Name("Id")]
    [Index(0)]
    public int Id { get; set; }

    [Name("EnrollmentNumber")]
    [Index(1)]
    public string EnrollmentNumber { get; set; } = string.Empty;

    [Name("StudentName")]
    [Index(2)]
    public string StudentName { get; set; } = string.Empty;

    [Name("SubjectCode")]
    [Index(3)]
    public string SubjectCode { get; set; } = string.Empty;

    [Name("SubjectName")]
    [Index(4)]
    public string SubjectName { get; set; } = string.Empty;

    [Name("AssessmentName")]
    [Index(5)]
    public string AssessmentName { get; set; } = string.Empty;

    [Name("MaxMarks")]
    [Index(6)]
    public decimal MaxMarks { get; set; }

    [Name("ObtainedMarks")]
    [Index(7)]
    public decimal? ObtainedMarks { get; set; }

    [Name("Percentage")]
    [Index(8)]
    public decimal? Percentage { get; set; }

    [Name("IsAbsent")]
    [Index(9)]
    public bool IsAbsent { get; set; }

    [Name("Remarks")]
    [Index(10)]
    public string? Remarks { get; set; }

    [Name("GradedBy")]
    [Index(11)]
    public string GradedBy { get; set; } = string.Empty;

    [Name("GradedDate")]
    [Index(12)]
    public DateTime? GradedDate { get; set; }
}

/// <summary>
/// Grade template for teachers to fill
/// </summary>
public class GradeTemplateCsvResponse
{
    [Name("EnrollmentNumber")]
    [Index(0)]
    public string EnrollmentNumber { get; set; } = string.Empty;

    [Name("StudentName")]
    [Index(1)]
    public string StudentName { get; set; } = string.Empty;

    [Name("ObtainedMarks")]
    [Index(2)]
    public string ObtainedMarks { get; set; } = string.Empty; // Empty for teachers to fill

    [Name("IsAbsent")]
    [Index(3)]
    public string IsAbsent { get; set; } = "false";

    [Name("Remarks")]
    [Index(4)]
    public string Remarks { get; set; } = string.Empty;
}
