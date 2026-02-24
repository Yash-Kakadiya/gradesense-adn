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
            // TODO: Add authorization check - students should only access their own dashboard
            // var currentUserId = int.Parse(User.FindFirst("userId")?.Value ?? "0");
            // if (!User.IsInRole("Admin") && currentUserId != studentId)
            //     return Forbid();

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
            // Get user ID from JWT claims - check multiple claim types for compatibility
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value;
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

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
