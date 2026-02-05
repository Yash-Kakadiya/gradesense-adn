using CsvHelper.Configuration.Attributes;

namespace GradeSense.API.DTOs.StudentMark.Request;

/// <summary>
/// CSV Import model for Student Marks (Grades)
/// Supports bulk grade entry for an assessment
/// </summary>
public class StudentMarkCsvImportRequest
{
    [Name("EnrollmentNumber")]
    [Index(0)]
    public string EnrollmentNumber { get; set; } = string.Empty;

    [Name("ObtainedMarks")]
    [Index(1)]
    [Optional]
    public decimal? ObtainedMarks { get; set; }

    [Name("IsAbsent")]
    [Index(2)]
    [Optional]
    public bool IsAbsent { get; set; } = false;

    [Name("Remarks")]
    [Index(3)]
    [Optional]
    public string? Remarks { get; set; }
}

/// <summary>
/// Request for bulk grade import with assessment context
/// </summary>
public class BulkGradeImportRequest
{
    public int AssessmentItemId { get; set; }
    public int GraderId { get; set; }
    public IFormFile File { get; set; } = null!;
}

/// <summary>
/// Export filter for grades CSV
/// </summary>
public class StudentMarkExportFilterRequest
{
    public int? CourseOfferingId { get; set; }
    public int? AssessmentItemId { get; set; }
    public int? StudentId { get; set; }
}
