using GradeSense.API.DTOs.Export;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GradeSense.API.Controllers;

/// <summary>
/// Controller for faculty-specific data export functionality.
/// Allows faculty to export student data for their assigned courses.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Faculty")]
public class FacultyExportController : ControllerBase
{
    private readonly IFacultyExportService _facultyExportService;
    private readonly ILogger<FacultyExportController> _logger;

    public FacultyExportController(
        IFacultyExportService facultyExportService,
        ILogger<FacultyExportController> logger)
    {
        _facultyExportService = facultyExportService;
        _logger = logger;
    }

    /// <summary>
    /// Get the current faculty's ID from the authenticated user claims.
    /// For faculty, the UserId equals the FacultyId.
    /// </summary>
    private int GetCurrentFacultyId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var facultyId))
        {
            throw new UnauthorizedAccessException("Unable to determine faculty identity");
        }
        return facultyId;
    }

    #region Student Roster Exports

    /// <summary>
    /// Export student roster for a course to CSV format
    /// </summary>
    [HttpGet("roster/{courseOfferingId}/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportRosterToCsv(int courseOfferingId, [FromQuery] string? status = null)
    {
        try
        {
            var facultyId = GetCurrentFacultyId();
            _logger.LogInformation("Faculty {FacultyId} requesting roster CSV export for course {CourseOfferingId}",
                facultyId, courseOfferingId);

            var request = new FacultyRosterExportRequest
            {
                CourseOfferingId = courseOfferingId,
                Status = status
            };

            var csvBytes = await _facultyExportService.ExportStudentRosterToCsvAsync(facultyId, request);

            var fileName = $"student_roster_{courseOfferingId}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
            return File(csvBytes, "text/csv", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized roster export attempt");
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for roster export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting roster to CSV");
            return StatusCode(500, "An error occurred while exporting student roster");
        }
    }

    /// <summary>
    /// Export student roster for a course to Excel format
    /// </summary>
    [HttpGet("roster/{courseOfferingId}/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportRosterToExcel(int courseOfferingId, [FromQuery] string? status = null)
    {
        try
        {
            var facultyId = GetCurrentFacultyId();
            _logger.LogInformation("Faculty {FacultyId} requesting roster Excel export for course {CourseOfferingId}",
                facultyId, courseOfferingId);

            var request = new FacultyRosterExportRequest
            {
                CourseOfferingId = courseOfferingId,
                Status = status
            };

            var excelBytes = await _facultyExportService.ExportStudentRosterToExcelAsync(facultyId, request);

            var fileName = $"student_roster_{courseOfferingId}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized roster export attempt");
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for roster export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting roster to Excel");
            return StatusCode(500, "An error occurred while exporting student roster");
        }
    }

    #endregion

    #region Grades Exports

    /// <summary>
    /// Export all student grades for a course to CSV format
    /// </summary>
    [HttpGet("grades/{courseOfferingId}/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportGradesToCsv(int courseOfferingId, [FromQuery] int? assessmentItemId = null)
    {
        try
        {
            var facultyId = GetCurrentFacultyId();
            _logger.LogInformation("Faculty {FacultyId} requesting grades CSV export for course {CourseOfferingId}",
                facultyId, courseOfferingId);

            var request = new FacultyGradesExportRequest
            {
                CourseOfferingId = courseOfferingId,
                AssessmentItemId = assessmentItemId
            };

            var csvBytes = await _facultyExportService.ExportGradesToCsvAsync(facultyId, request);

            var fileName = $"grades_{courseOfferingId}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
            return File(csvBytes, "text/csv", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized grades export attempt");
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for grades export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting grades to CSV");
            return StatusCode(500, "An error occurred while exporting grades");
        }
    }

    /// <summary>
    /// Export all student grades for a course to Excel format
    /// </summary>
    [HttpGet("grades/{courseOfferingId}/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportGradesToExcel(int courseOfferingId, [FromQuery] int? assessmentItemId = null)
    {
        try
        {
            var facultyId = GetCurrentFacultyId();
            _logger.LogInformation("Faculty {FacultyId} requesting grades Excel export for course {CourseOfferingId}",
                facultyId, courseOfferingId);

            var request = new FacultyGradesExportRequest
            {
                CourseOfferingId = courseOfferingId,
                AssessmentItemId = assessmentItemId
            };

            var excelBytes = await _facultyExportService.ExportGradesToExcelAsync(facultyId, request);

            var fileName = $"grades_{courseOfferingId}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized grades export attempt");
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for grades export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting grades to Excel");
            return StatusCode(500, "An error occurred while exporting grades");
        }
    }

    /// <summary>
    /// Export grades for a specific assessment
    /// </summary>
    [HttpGet("assessment/{assessmentItemId}/grades")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportAssessmentGrades(int assessmentItemId)
    {
        try
        {
            var facultyId = GetCurrentFacultyId();
            _logger.LogInformation("Faculty {FacultyId} requesting assessment grades export for assessment {AssessmentItemId}",
                facultyId, assessmentItemId);

            var excelBytes = await _facultyExportService.ExportAssessmentGradesAsync(facultyId, assessmentItemId);

            var fileName = $"assessment_grades_{assessmentItemId}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized assessment grades export attempt");
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for assessment grades export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting assessment grades");
            return StatusCode(500, "An error occurred while exporting assessment grades");
        }
    }

    #endregion

    #region Attendance Exports

    /// <summary>
    /// Export attendance records for a course to CSV format
    /// </summary>
    [HttpGet("attendance/{courseOfferingId}/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportAttendanceToCsv(
        int courseOfferingId,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        try
        {
            var facultyId = GetCurrentFacultyId();
            _logger.LogInformation("Faculty {FacultyId} requesting attendance CSV export for course {CourseOfferingId}",
                facultyId, courseOfferingId);

            var request = new FacultyAttendanceExportRequest
            {
                CourseOfferingId = courseOfferingId,
                FromDate = fromDate,
                ToDate = toDate
            };

            var csvBytes = await _facultyExportService.ExportAttendanceToCsvAsync(facultyId, request);

            var fileName = $"attendance_{courseOfferingId}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
            return File(csvBytes, "text/csv", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized attendance export attempt");
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for attendance export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting attendance to CSV");
            return StatusCode(500, "An error occurred while exporting attendance");
        }
    }

    /// <summary>
    /// Export attendance records for a course to Excel format
    /// </summary>
    [HttpGet("attendance/{courseOfferingId}/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportAttendanceToExcel(
        int courseOfferingId,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        try
        {
            var facultyId = GetCurrentFacultyId();
            _logger.LogInformation("Faculty {FacultyId} requesting attendance Excel export for course {CourseOfferingId}",
                facultyId, courseOfferingId);

            var request = new FacultyAttendanceExportRequest
            {
                CourseOfferingId = courseOfferingId,
                FromDate = fromDate,
                ToDate = toDate
            };

            var excelBytes = await _facultyExportService.ExportAttendanceToExcelAsync(facultyId, request);

            var fileName = $"attendance_{courseOfferingId}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized attendance export attempt");
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for attendance export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting attendance to Excel");
            return StatusCode(500, "An error occurred while exporting attendance");
        }
    }

    #endregion

    #region At-Risk Students Exports

    /// <summary>
    /// Export at-risk students for a course to CSV format
    /// </summary>
    [HttpGet("at-risk/{courseOfferingId}/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportAtRiskToCsv(int courseOfferingId, [FromQuery] string? riskLevel = null)
    {
        try
        {
            var facultyId = GetCurrentFacultyId();
            _logger.LogInformation("Faculty {FacultyId} requesting at-risk CSV export for course {CourseOfferingId}",
                facultyId, courseOfferingId);

            var request = new FacultyAtRiskExportRequest
            {
                CourseOfferingId = courseOfferingId,
                RiskLevel = riskLevel
            };

            var csvBytes = await _facultyExportService.ExportAtRiskStudentsToCsvAsync(facultyId, request);

            var fileName = $"at_risk_students_{courseOfferingId}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
            return File(csvBytes, "text/csv", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized at-risk export attempt");
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for at-risk export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting at-risk students to CSV");
            return StatusCode(500, "An error occurred while exporting at-risk students");
        }
    }

    /// <summary>
    /// Export at-risk students for a course to Excel format
    /// </summary>
    [HttpGet("at-risk/{courseOfferingId}/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportAtRiskToExcel(int courseOfferingId, [FromQuery] string? riskLevel = null)
    {
        try
        {
            var facultyId = GetCurrentFacultyId();
            _logger.LogInformation("Faculty {FacultyId} requesting at-risk Excel export for course {CourseOfferingId}",
                facultyId, courseOfferingId);

            var request = new FacultyAtRiskExportRequest
            {
                CourseOfferingId = courseOfferingId,
                RiskLevel = riskLevel
            };

            var excelBytes = await _facultyExportService.ExportAtRiskStudentsToExcelAsync(facultyId, request);

            var fileName = $"at_risk_students_{courseOfferingId}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized at-risk export attempt");
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for at-risk export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting at-risk students to Excel");
            return StatusCode(500, "An error occurred while exporting at-risk students");
        }
    }

    #endregion

    #region Comprehensive Reports

    /// <summary>
    /// Export comprehensive course report (roster, grades, attendance, at-risk)
    /// </summary>
    [HttpGet("course-report/{courseOfferingId}")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportCourseReport(int courseOfferingId)
    {
        try
        {
            var facultyId = GetCurrentFacultyId();
            _logger.LogInformation("Faculty {FacultyId} requesting comprehensive course report for course {CourseOfferingId}",
                facultyId, courseOfferingId);

            var excelBytes = await _facultyExportService.ExportCourseReportAsync(facultyId, courseOfferingId);

            var fileName = $"course_report_{courseOfferingId}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized course report export attempt");
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for course report export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting course report");
            return StatusCode(500, "An error occurred while exporting course report");
        }
    }

    #endregion
}
