using GradeSense.API.DTOs.Export;

namespace GradeSense.API.Interfaces.Services;

/// <summary>
/// Service interface for student-specific data export functionality.
/// Allows students to export their own academic data (transcript, grades, attendance).
/// </summary>
public interface IStudentExportService
{
    #region Transcript Exports

    /// <summary>
    /// Export student's academic transcript to CSV format
    /// </summary>
    /// <param name="studentId">The student's ID</param>
    /// <param name="filter">Optional filter parameters</param>
    /// <returns>CSV file as byte array</returns>
    Task<byte[]> ExportTranscriptToCsvAsync(int studentId, StudentTranscriptExportRequest? filter = null);

    /// <summary>
    /// Export student's academic transcript to Excel format (with full details)
    /// </summary>
    /// <param name="studentId">The student's ID</param>
    /// <param name="filter">Optional filter parameters</param>
    /// <returns>Excel file as byte array</returns>
    Task<byte[]> ExportTranscriptToExcelAsync(int studentId, StudentTranscriptExportRequest? filter = null);

    #endregion

    #region Grades Exports

    /// <summary>
    /// Export student's grades for a specific course to CSV format
    /// </summary>
    /// <param name="studentId">The student's ID</param>
    /// <param name="courseOfferingId">The course offering ID</param>
    /// <returns>CSV file as byte array</returns>
    Task<byte[]> ExportGradesToCsvAsync(int studentId, int courseOfferingId);

    /// <summary>
    /// Export student's grades for a specific course to Excel format
    /// </summary>
    /// <param name="studentId">The student's ID</param>
    /// <param name="courseOfferingId">The course offering ID</param>
    /// <returns>Excel file as byte array</returns>
    Task<byte[]> ExportGradesToExcelAsync(int studentId, int courseOfferingId);

    /// <summary>
    /// Export all grades across all courses to Excel format
    /// </summary>
    /// <param name="studentId">The student's ID</param>
    /// <param name="semester">Optional semester filter</param>
    /// <returns>Excel file as byte array</returns>
    Task<byte[]> ExportAllGradesToExcelAsync(int studentId, int? semester = null);

    #endregion

    #region Attendance Exports

    /// <summary>
    /// Export student's attendance records to CSV format
    /// </summary>
    /// <param name="studentId">The student's ID</param>
    /// <param name="filter">Optional filter parameters</param>
    /// <returns>CSV file as byte array</returns>
    Task<byte[]> ExportAttendanceToCsvAsync(int studentId, StudentAttendanceExportRequest? filter = null);

    /// <summary>
    /// Export student's attendance records to Excel format (with summary)
    /// </summary>
    /// <param name="studentId">The student's ID</param>
    /// <param name="filter">Optional filter parameters</param>
    /// <returns>Excel file as byte array</returns>
    Task<byte[]> ExportAttendanceToExcelAsync(int studentId, StudentAttendanceExportRequest? filter = null);

    #endregion

    #region Combined Reports

    /// <summary>
    /// Export a comprehensive academic report including grades, attendance and performance
    /// </summary>
    /// <param name="studentId">The student's ID</param>
    /// <param name="semester">Optional semester filter</param>
    /// <returns>Excel file as byte array</returns>
    Task<byte[]> ExportAcademicReportToExcelAsync(int studentId, int? semester = null);

    #endregion
}
