using GradeSense.API.DTOs.Export;

namespace GradeSense.API.Interfaces.Services;

/// <summary>
/// Service interface for faculty-specific data export functionality.
/// Allows faculty to export student rosters, grades, attendance, and at-risk reports
/// for their assigned courses.
/// </summary>
public interface IFacultyExportService
{
    #region Student Roster Exports

    /// <summary>
    /// Export student roster for a course to CSV format
    /// </summary>
    /// <param name="facultyId">The faculty's ID</param>
    /// <param name="request">Export request with course offering ID</param>
    /// <returns>CSV file as byte array</returns>
    Task<byte[]> ExportStudentRosterToCsvAsync(int facultyId, FacultyRosterExportRequest request);

    /// <summary>
    /// Export student roster for a course to Excel format (with detailed info)
    /// </summary>
    /// <param name="facultyId">The faculty's ID</param>
    /// <param name="request">Export request with course offering ID</param>
    /// <returns>Excel file as byte array</returns>
    Task<byte[]> ExportStudentRosterToExcelAsync(int facultyId, FacultyRosterExportRequest request);

    #endregion

    #region Grades Exports

    /// <summary>
    /// Export all student grades for a course to CSV format
    /// </summary>
    /// <param name="facultyId">The faculty's ID</param>
    /// <param name="request">Export request with course offering ID and optional assessment filter</param>
    /// <returns>CSV file as byte array</returns>
    Task<byte[]> ExportGradesToCsvAsync(int facultyId, FacultyGradesExportRequest request);

    /// <summary>
    /// Export all student grades for a course to Excel format (with summary sheets)
    /// </summary>
    /// <param name="facultyId">The faculty's ID</param>
    /// <param name="request">Export request with course offering ID and optional assessment filter</param>
    /// <returns>Excel file as byte array</returns>
    Task<byte[]> ExportGradesToExcelAsync(int facultyId, FacultyGradesExportRequest request);

    /// <summary>
    /// Export grade report for a specific assessment
    /// </summary>
    /// <param name="facultyId">The faculty's ID</param>
    /// <param name="assessmentItemId">The assessment item ID</param>
    /// <returns>Excel file as byte array</returns>
    Task<byte[]> ExportAssessmentGradesAsync(int facultyId, int assessmentItemId);

    #endregion

    #region Attendance Exports

    /// <summary>
    /// Export attendance records for a course to CSV format
    /// </summary>
    /// <param name="facultyId">The faculty's ID</param>
    /// <param name="request">Export request with course offering ID and date range</param>
    /// <returns>CSV file as byte array</returns>
    Task<byte[]> ExportAttendanceToCsvAsync(int facultyId, FacultyAttendanceExportRequest request);

    /// <summary>
    /// Export attendance records for a course to Excel format (with summary)
    /// </summary>
    /// <param name="facultyId">The faculty's ID</param>
    /// <param name="request">Export request with course offering ID and date range</param>
    /// <returns>Excel file as byte array</returns>
    Task<byte[]> ExportAttendanceToExcelAsync(int facultyId, FacultyAttendanceExportRequest request);

    #endregion

    #region At-Risk Students Export

    /// <summary>
    /// Export at-risk students for a course to CSV format
    /// </summary>
    /// <param name="facultyId">The faculty's ID</param>
    /// <param name="request">Export request with course offering ID and optional risk level filter</param>
    /// <returns>CSV file as byte array</returns>
    Task<byte[]> ExportAtRiskStudentsToCsvAsync(int facultyId, FacultyAtRiskExportRequest request);

    /// <summary>
    /// Export at-risk students for a course to Excel format (with detailed analysis)
    /// </summary>
    /// <param name="facultyId">The faculty's ID</param>
    /// <param name="request">Export request with course offering ID and optional risk level filter</param>
    /// <returns>Excel file as byte array</returns>
    Task<byte[]> ExportAtRiskStudentsToExcelAsync(int facultyId, FacultyAtRiskExportRequest request);

    #endregion

    #region Comprehensive Reports

    /// <summary>
    /// Export comprehensive course report with all data (roster, grades, attendance, at-risk)
    /// </summary>
    /// <param name="facultyId">The faculty's ID</param>
    /// <param name="courseOfferingId">The course offering ID</param>
    /// <returns>Excel file as byte array with multiple sheets</returns>
    Task<byte[]> ExportCourseReportAsync(int facultyId, int courseOfferingId);

    #endregion

    #region Validation

    /// <summary>
    /// Validate that the faculty has access to the specified course
    /// </summary>
    /// <param name="facultyId">The faculty's ID</param>
    /// <param name="courseOfferingId">The course offering ID</param>
    /// <returns>True if faculty has access</returns>
    Task<bool> ValidateFacultyAccessAsync(int facultyId, int courseOfferingId);

    #endregion
}
