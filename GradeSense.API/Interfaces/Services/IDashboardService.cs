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

    /// <summary>
    /// Get attendance calendar data for a student
    /// </summary>
    /// <param name="studentId">Student ID</param>
    /// <param name="year">Year (default: current year)</param>
    /// <param name="month">Month 1-12 (default: current month)</param>
    /// <param name="courseOfferingId">Optional course filter</param>
    Task<AttendanceCalendarResponse> GetAttendanceCalendarAsync(int studentId, int? year = null, int? month = null, int? courseOfferingId = null);

    /// <summary>
    /// Get comprehensive grade analytics for a student
    /// </summary>
    /// <param name="studentId">Student ID</param>
    /// <param name="semesterFilter">Optional semester filter</param>
    Task<GradeAnalyticsResponse> GetGradeAnalyticsAsync(int studentId, int? semesterFilter = null);

    /// <summary>
    /// Calculate What-If GPA projections
    /// </summary>
    /// <param name="request">What-if calculator request with hypothetical grades</param>
    Task<WhatIfCalculatorResponse> CalculateWhatIfAsync(WhatIfCalculatorRequest request);

    /// <summary>
    /// Enhanced analytics for comparative, trend, and distribution views
    /// </summary>
    /// <param name="request">Analytics filter request</param>
    /// <param name="facultyScopeId">Optional faculty scope (enforced for faculty callers)</param>
    Task<EnhancedAnalyticsResponse> GetEnhancedAnalyticsAsync(EnhancedAnalyticsRequest request, int? facultyScopeId = null);
}
