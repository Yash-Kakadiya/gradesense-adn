namespace GradeSense.API.DTOs.Export;

/// <summary>
/// Export filter request with common properties for all exports
/// </summary>
public class ExportFilterRequest
{
    public bool? IsActive { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

/// <summary>
/// User export filter
/// </summary>
public class UserExportFilterRequest : ExportFilterRequest
{
    public string? Role { get; set; }
    public string? Search { get; set; }
}

/// <summary>
/// Faculty export filter
/// </summary>
public class FacultyExportFilterRequest : ExportFilterRequest
{
    public int? DepartmentId { get; set; }
    public string? Designation { get; set; }
    public string? Search { get; set; }
}

/// <summary>
/// Department export filter
/// </summary>
public class DepartmentExportFilterRequest : ExportFilterRequest
{
    public string? Search { get; set; }
}

/// <summary>
/// Batch export filter
/// </summary>
public class BatchExportFilterRequest : ExportFilterRequest
{
    public int? DepartmentId { get; set; }
    public int? Semester { get; set; }
    public int? AcademicYear { get; set; }
    public string? Search { get; set; }
}

/// <summary>
/// Subject export filter
/// </summary>
public class SubjectExportFilterRequest : ExportFilterRequest
{
    public int? DepartmentId { get; set; }
    public int? Semester { get; set; }
    public string? SubjectType { get; set; }
    public bool? IsElective { get; set; }
    public string? Search { get; set; }
}

/// <summary>
/// Course Offering export filter
/// </summary>
public class CourseOfferingExportFilterRequest : ExportFilterRequest
{
    public int? SubjectId { get; set; }
    public int? BatchId { get; set; }
    public int? DepartmentId { get; set; }
    public int? AcademicYear { get; set; }
    public string? Search { get; set; }
}

/// <summary>
/// Evaluation Scheme export filter
/// </summary>
public class EvaluationSchemeExportFilterRequest : ExportFilterRequest
{
    public int? CourseOfferingId { get; set; }
    public int? SubjectId { get; set; }
    public int? BatchId { get; set; }
    public string? EvaluationType { get; set; }
    public string? Search { get; set; }
}

/// <summary>
/// Audit Log export filter
/// </summary>
public class AuditLogExportFilterRequest
{
    public string? Action { get; set; }
    public string? EntityName { get; set; }
    public int? ActorUserId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? Search { get; set; }
}
