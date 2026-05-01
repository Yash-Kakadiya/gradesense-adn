using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Dashboard;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers;

/// <summary>
/// Dashboard API endpoints for Admin, Student, and Faculty views
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(
        IDashboardService dashboardService,
        ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }

    /// <summary>
    /// Get admin dashboard with system-wide statistics
    /// </summary>
    /// <remarks>
    /// Provides comprehensive system overview including:
    /// - User and entity counts
    /// - Department statistics
    /// - Recent activities
    /// - Enrollment trends
    /// </remarks>
    /// <returns>Admin dashboard data</returns>
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<AdminDashboardResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<AdminDashboardResponse>>> GetAdminDashboard()
    {
        try
        {
            _logger.LogInformation("Admin dashboard requested");
            var dashboard = await _dashboardService.GetAdminDashboardAsync();
            return Ok(ApiResponse<AdminDashboardResponse>.SuccessResponse(dashboard, "Admin dashboard retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching admin dashboard");
            return StatusCode(500, ApiResponse<AdminDashboardResponse>.ErrorResponse("An error occurred while fetching dashboard data"));
        }
    }

    /// <summary>
    /// Get student dashboard with personal academic overview
    /// </summary>
    /// <remarks>
    /// Provides student-specific data including:
    /// - Enrolled courses and progress
    /// - Recent grades and performance
    /// - Attendance statistics
    /// - Risk assessment (if available)
    /// </remarks>
    /// <param name="studentId">Student ID</param>
    /// <returns>Student dashboard data</returns>
    [HttpGet("student/{studentId:int}")]
    [Authorize(Roles = "Admin,Student")]
    [ProducesResponseType(typeof(ApiResponse<StudentDashboardResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<StudentDashboardResponse>>> GetStudentDashboard(int studentId)
    {
        try
        {
            // Students can only access their own dashboard
            if (User.IsInRole("Student"))
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId != studentId)
                {
                    return Forbid();
                }
            }

            _logger.LogInformation("Student dashboard requested for student ID: {StudentId}", studentId);
            var dashboard = await _dashboardService.GetStudentDashboardAsync(studentId);
            return Ok(ApiResponse<StudentDashboardResponse>.SuccessResponse(dashboard, "Student dashboard retrieved successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Student not found for dashboard: {StudentId}", studentId);
            return NotFound(ApiResponse<StudentDashboardResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching student dashboard for ID: {StudentId}", studentId);
            return StatusCode(500, ApiResponse<StudentDashboardResponse>.ErrorResponse("An error occurred while fetching dashboard data"));
        }
    }

    /// <summary>
    /// Get student attendance calendar view
    /// </summary>
    /// <remarks>
    /// Provides a calendar view of student attendance with:
    /// - Monthly calendar with day-wise attendance
    /// - Course filtering option
    /// - Summary statistics for the month
    /// - Available courses for filter
    /// </remarks>
    /// <param name="studentId">Student ID</param>
    /// <param name="year">Year (optional, defaults to current year)</param>
    /// <param name="month">Month 1-12 (optional, defaults to current month)</param>
    /// <param name="courseOfferingId">Course offering ID for filtering (optional)</param>
    /// <returns>Attendance calendar data</returns>
    [HttpGet("student/{studentId:int}/attendance-calendar")]
    [Authorize(Roles = "Admin,Student")]
    [ProducesResponseType(typeof(ApiResponse<AttendanceCalendarResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<AttendanceCalendarResponse>>> GetAttendanceCalendar(
        int studentId,
        [FromQuery] int? year = null,
        [FromQuery] int? month = null,
        [FromQuery] int? courseOfferingId = null)
    {
        try
        {
            // Students can only access their own attendance
            if (User.IsInRole("Student"))
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId != studentId)
                {
                    return Forbid();
                }
            }

            _logger.LogInformation("Attendance calendar requested for student ID: {StudentId}, Year: {Year}, Month: {Month}", studentId, year, month);
            var calendar = await _dashboardService.GetAttendanceCalendarAsync(studentId, year, month, courseOfferingId);
            return Ok(ApiResponse<AttendanceCalendarResponse>.SuccessResponse(calendar, "Attendance calendar retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching attendance calendar for student ID: {StudentId}", studentId);
            return StatusCode(500, ApiResponse<AttendanceCalendarResponse>.ErrorResponse("An error occurred while fetching attendance calendar"));
        }
    }

    /// <summary>
    /// Get comprehensive grade analytics for a student
    /// </summary>
    /// <remarks>
    /// Provides detailed grade analysis including:
    /// - Grade distribution (A, B, C, D, F counts)
    /// - Course-wise performance breakdown
    /// - Assessment type performance
    /// - Semester GPA trends
    /// </remarks>
    /// <param name="studentId">Student ID</param>
    /// <param name="semester">Optional semester filter</param>
    /// <returns>Grade analytics data</returns>
    [HttpGet("student/{studentId:int}/grade-analytics")]
    [Authorize(Roles = "Admin,Student")]
    [ProducesResponseType(typeof(ApiResponse<GradeAnalyticsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<GradeAnalyticsResponse>>> GetGradeAnalytics(
        int studentId,
        [FromQuery] int? semester = null)
    {
        try
        {
            // Students can only access their own analytics
            if (User.IsInRole("Student"))
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId != studentId)
                {
                    return Forbid();
                }
            }

            _logger.LogInformation("Grade analytics requested for student ID: {StudentId}, Semester: {Semester}", studentId, semester);
            var analytics = await _dashboardService.GetGradeAnalyticsAsync(studentId, semester);
            return Ok(ApiResponse<GradeAnalyticsResponse>.SuccessResponse(analytics, "Grade analytics retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching grade analytics for student ID: {StudentId}", studentId);
            return StatusCode(500, ApiResponse<GradeAnalyticsResponse>.ErrorResponse("An error occurred while fetching grade analytics"));
        }
    }

    /// <summary>
    /// Calculate What-If GPA projection
    /// </summary>
    /// <remarks>
    /// Allows students to input hypothetical grades and see:
    /// - Projected semester GPA
    /// - Projected CGPA
    /// - Impact analysis (positive/negative/neutral)
    /// - Grade requirements to achieve targets
    /// </remarks>
    /// <param name="request">What-if calculator request with hypothetical grades</param>
    /// <returns>GPA projection results</returns>
    [HttpPost("student/what-if-calculator")]
    [Authorize(Roles = "Admin,Student")]
    [ProducesResponseType(typeof(ApiResponse<WhatIfCalculatorResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<WhatIfCalculatorResponse>>> CalculateWhatIf(
        [FromBody] WhatIfCalculatorRequest request)
    {
        try
        {
            // Students can only calculate for themselves
            if (User.IsInRole("Student"))
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId != request.StudentId)
                {
                    return Forbid();
                }
            }

            _logger.LogInformation("What-if calculation requested for student ID: {StudentId}", request.StudentId);
            var result = await _dashboardService.CalculateWhatIfAsync(request);
            return Ok(ApiResponse<WhatIfCalculatorResponse>.SuccessResponse(result, "What-if calculation completed successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating what-if for student ID: {StudentId}", request.StudentId);
            return StatusCode(500, ApiResponse<WhatIfCalculatorResponse>.ErrorResponse("An error occurred while calculating projections"));
        }
    }

    /// <summary>
    /// Get enhanced analytics (cross-batch, trends, distributions)
    /// </summary>
    /// <param name="request">Filters for subject, batch, course, date range, and minimum sample size</param>
    [HttpPost("analytics/enhanced")]
    [Authorize(Roles = "Admin,Faculty")]
    [ProducesResponseType(typeof(ApiResponse<EnhancedAnalyticsResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<EnhancedAnalyticsResponse>>> GetEnhancedAnalytics([FromBody] EnhancedAnalyticsRequest request)
    {
        try
        {
            int? facultyScopeId = null;
            if (User.IsInRole("Faculty"))
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (!string.IsNullOrEmpty(userIdClaim) && int.TryParse(userIdClaim, out var facultyId))
                {
                    facultyScopeId = facultyId;
                }
            }

            _logger.LogInformation("Enhanced analytics requested with filters: Subject {SubjectId}, Batch {BatchId}, CourseOffering {CourseOfferingId}",
                request.SubjectId, request.BatchId, request.CourseOfferingId);

            var analytics = await _dashboardService.GetEnhancedAnalyticsAsync(request, facultyScopeId);
            return Ok(ApiResponse<EnhancedAnalyticsResponse>.SuccessResponse(analytics, "Enhanced analytics retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching enhanced analytics");
            return StatusCode(500, ApiResponse<EnhancedAnalyticsResponse>.ErrorResponse("An error occurred while fetching analytics"));
        }
    }

    /// <summary>
    /// Get faculty dashboard with teaching overview
    /// </summary>
    /// <remarks>
    /// Provides faculty-specific data including:
    /// - Courses being taught
    /// - Pending grading items
    /// - Student performance distribution
    /// - At-risk students
    /// </remarks>
    /// <param name="facultyId">Faculty ID</param>
    /// <returns>Faculty dashboard data</returns>
    [HttpGet("faculty/{facultyId:int}")]
    [Authorize(Roles = "Admin,Faculty")]
    [ProducesResponseType(typeof(ApiResponse<FacultyDashboardResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<FacultyDashboardResponse>>> GetFacultyDashboard(int facultyId)
    {
        try
        {
            // TODO: Add authorization check - faculty should only access their own dashboard
            // var currentUserId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            // if (!User.IsInRole("Admin") && currentUserId != facultyId)
            //     return Forbid();

            _logger.LogInformation("Faculty dashboard requested for faculty ID: {FacultyId}", facultyId);
            var dashboard = await _dashboardService.GetFacultyDashboardAsync(facultyId);
            return Ok(ApiResponse<FacultyDashboardResponse>.SuccessResponse(dashboard, "Faculty dashboard retrieved successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Faculty not found for dashboard: {FacultyId}", facultyId);
            return NotFound(ApiResponse<FacultyDashboardResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching faculty dashboard for ID: {FacultyId}", facultyId);
            return StatusCode(500, ApiResponse<FacultyDashboardResponse>.ErrorResponse("An error occurred while fetching dashboard data"));
        }
    }

    /// <summary>
    /// Get dashboard for current logged-in user based on their role
    /// </summary>
    /// <remarks>
    /// Automatically determines the user's role and returns appropriate dashboard.
    /// Admin users get redirected to admin dashboard.
    /// Students and Faculty get their personal dashboard.
    /// </remarks>
    /// <returns>Dashboard data based on user role</returns>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<AdminDashboardResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<StudentDashboardResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<FacultyDashboardResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult> GetMyDashboard()
    {
        try
        {
            // Get user ID from JWT claims
            var userIdClaim = User.FindFirst("sub")?.Value;
            var roleClaim = User.FindFirst("role")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("User ID not found in token"));
            }

            var userId = int.Parse(userIdClaim);

            _logger.LogInformation("Dashboard requested for user ID: {UserId} with role: {Role}", userId, roleClaim);

            return roleClaim?.ToLower() switch
            {
                "admin" => Ok(ApiResponse<AdminDashboardResponse>.SuccessResponse(
                    await _dashboardService.GetAdminDashboardAsync(), "Admin dashboard retrieved successfully")),
                "student" => Ok(ApiResponse<StudentDashboardResponse>.SuccessResponse(
                    await _dashboardService.GetStudentDashboardAsync(userId), "Student dashboard retrieved successfully")),
                "faculty" => Ok(ApiResponse<FacultyDashboardResponse>.SuccessResponse(
                    await _dashboardService.GetFacultyDashboardAsync(userId), "Faculty dashboard retrieved successfully")),
                _ => BadRequest(ApiResponse<object>.ErrorResponse($"Unknown role: {roleClaim}"))
            };
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "User profile not found for dashboard");
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching personal dashboard");
            return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while fetching dashboard data"));
        }
    }
}
