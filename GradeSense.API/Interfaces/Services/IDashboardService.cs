using GradeSense.API.DTOs.Dashboard;

namespace GradeSense.API.Interfaces.Services;

/// <summary>
/// Dashboard service interface for role-specific dashboards
/// </summary>
public interface IDashboardService
{
    /// <summary>
    /// Get admin dashboard with system-wide statistics
    /// </summary>
    Task<AdminDashboardResponse> GetAdminDashboardAsync();

    /// <summary>
    /// Get student dashboard with personal academic data
    /// </summary>
    /// <param name="studentId">Student ID (same as User ID)</param>
    Task<StudentDashboardResponse> GetStudentDashboardAsync(int studentId);

    /// <summary>
    /// Get faculty dashboard with teaching overview
    /// </summary>
    /// <param name="facultyId">Faculty ID (same as User ID)</param>
    Task<FacultyDashboardResponse> GetFacultyDashboardAsync(int facultyId);
}
