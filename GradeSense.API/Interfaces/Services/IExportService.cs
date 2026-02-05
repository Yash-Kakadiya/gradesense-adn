using GradeSense.API.DTOs.Export;
using GradeSense.API.DTOs.Student.Request;

namespace GradeSense.API.Interfaces.Services;

/// <summary>
/// Service interface for data export functionality
/// </summary>
public interface IExportService
{
    // User exports
    Task<byte[]> ExportUsersToCsvAsync(UserExportFilterRequest filter);
    Task<byte[]> ExportUsersToExcelAsync(UserExportFilterRequest filter);

    // Faculty exports
    Task<byte[]> ExportFacultiesToCsvAsync(FacultyExportFilterRequest filter);
    Task<byte[]> ExportFacultiesToExcelAsync(FacultyExportFilterRequest filter);

    // Student exports
    Task<byte[]> ExportStudentsToCsvAsync(StudentExportFilterRequest filter);
    Task<byte[]> ExportStudentsToExcelAsync(StudentExportFilterRequest filter);

    // Department exports
    Task<byte[]> ExportDepartmentsToCsvAsync(DepartmentExportFilterRequest filter);
    Task<byte[]> ExportDepartmentsToExcelAsync(DepartmentExportFilterRequest filter);

    // Batch exports
    Task<byte[]> ExportBatchesToCsvAsync(BatchExportFilterRequest filter);
    Task<byte[]> ExportBatchesToExcelAsync(BatchExportFilterRequest filter);

    // Subject exports
    Task<byte[]> ExportSubjectsToCsvAsync(SubjectExportFilterRequest filter);
    Task<byte[]> ExportSubjectsToExcelAsync(SubjectExportFilterRequest filter);

    // Course Offering exports
    Task<byte[]> ExportCourseOfferingsToCsvAsync(CourseOfferingExportFilterRequest filter);
    Task<byte[]> ExportCourseOfferingsToExcelAsync(CourseOfferingExportFilterRequest filter);

    // Evaluation Scheme exports
    Task<byte[]> ExportEvaluationSchemesToCsvAsync(EvaluationSchemeExportFilterRequest filter);
    Task<byte[]> ExportEvaluationSchemesToExcelAsync(EvaluationSchemeExportFilterRequest filter);

    // Audit Log exports
    Task<byte[]> ExportAuditLogsToCsvAsync(AuditLogExportFilterRequest filter);
    Task<byte[]> ExportAuditLogsToExcelAsync(AuditLogExportFilterRequest filter);
}
