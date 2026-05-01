using GradeSense.API.DTOs.Export;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GradeSense.API.Controllers;

/// <summary>
/// Controller for student-specific data export functionality.
/// Allows students to export their own academic data (transcript, grades, attendance).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Student")]
public class StudentExportController : ControllerBase
{
    private readonly IStudentExportService _studentExportService;
    private readonly ILogger<StudentExportController> _logger;

    public StudentExportController(
        IStudentExportService studentExportService, 
        ILogger<StudentExportController> logger)
    {
        _studentExportService = studentExportService;
        _logger = logger;
    }

    /// <summary>
    /// Get the current student's ID from the authenticated user claims.
    /// For students, the UserId equals the StudentId.
    /// </summary>
    private int GetCurrentStudentId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var studentId))
        {
            throw new UnauthorizedAccessException("Unable to determine student identity");
        }
        return studentId;
    }

    #region Transcript Exports

    /// <summary>
    /// Export student's academic transcript to CSV format
    /// </summary>
    /// <param name="filter">Optional filter parameters</param>
    /// <returns>CSV file download</returns>
    [HttpGet("transcript/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportTranscriptToCsv([FromQuery] StudentTranscriptExportRequest? filter)
    {
        try
        {
            var studentId = GetCurrentStudentId();
            _logger.LogInformation("Student {StudentId} requesting transcript CSV export", studentId);

            var csvBytes = await _studentExportService.ExportTranscriptToCsvAsync(studentId, filter);
            
            var fileName = $"transcript_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
            return File(csvBytes, "text/csv", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized transcript export attempt");
            return Unauthorized(ex.Message);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for transcript export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting transcript to CSV");
            return StatusCode(500, "An error occurred while exporting your transcript");
        }
    }

    /// <summary>
    /// Export student's academic transcript to Excel format
    /// </summary>
    /// <param name="filter">Optional filter parameters</param>
    /// <returns>Excel file download</returns>
    [HttpGet("transcript/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportTranscriptToExcel([FromQuery] StudentTranscriptExportRequest? filter)
    {
        try
        {
            var studentId = GetCurrentStudentId();
            _logger.LogInformation("Student {StudentId} requesting transcript Excel export", studentId);

            var excelBytes = await _studentExportService.ExportTranscriptToExcelAsync(studentId, filter);
            
            var fileName = $"transcript_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            return File(excelBytes, 
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized transcript export attempt");
            return Unauthorized(ex.Message);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for transcript export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting transcript to Excel");
            return StatusCode(500, "An error occurred while exporting your transcript");
        }
    }

    #endregion

    #region Grades Exports

    /// <summary>
    /// Export student's grades for a specific course to CSV format
    /// </summary>
    /// <param name="courseOfferingId">The course offering ID</param>
    /// <returns>CSV file download</returns>
    [HttpGet("grades/{courseOfferingId}/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportGradesToCsv(int courseOfferingId)
    {
        try
        {
            var studentId = GetCurrentStudentId();
            _logger.LogInformation("Student {StudentId} requesting grades CSV export for course {CourseOfferingId}", 
                studentId, courseOfferingId);

            var csvBytes = await _studentExportService.ExportGradesToCsvAsync(studentId, courseOfferingId);
            
            var fileName = $"grades_course{courseOfferingId}_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
            return File(csvBytes, "text/csv", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized grades export attempt");
            return Unauthorized(ex.Message);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for grades export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting grades to CSV");
            return StatusCode(500, "An error occurred while exporting your grades");
        }
    }

    /// <summary>
    /// Export student's grades for a specific course to Excel format
    /// </summary>
    /// <param name="courseOfferingId">The course offering ID</param>
    /// <returns>Excel file download</returns>
    [HttpGet("grades/{courseOfferingId}/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportGradesToExcel(int courseOfferingId)
    {
        try
        {
            var studentId = GetCurrentStudentId();
            _logger.LogInformation("Student {StudentId} requesting grades Excel export for course {CourseOfferingId}", 
                studentId, courseOfferingId);

            var excelBytes = await _studentExportService.ExportGradesToExcelAsync(studentId, courseOfferingId);
            
            var fileName = $"grades_course{courseOfferingId}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            return File(excelBytes, 
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized grades export attempt");
            return Unauthorized(ex.Message);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument for grades export");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting grades to Excel");
            return StatusCode(500, "An error occurred while exporting your grades");
        }
    }

    /// <summary>
    /// Export all grades across all courses to Excel format
    /// </summary>
    /// <param name="semester">Optional semester filter</param>
    /// <returns>Excel file download</returns>
    [HttpGet("grades/all/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportAllGradesToExcel([FromQuery] int? semester)
    {
        try
        {
            var studentId = GetCurrentStudentId();
            _logger.LogInformation("Student {StudentId} requesting all grades Excel export, semester: {Semester}", 
                studentId, semester);

            var excelBytes = await _studentExportService.ExportAllGradesToExcelAsync(studentId, semester);
            
            var semesterSuffix = semester.HasValue ? $"_sem{semester}" : "_all";
            var fileName = $"all_grades{semesterSuffix}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            return File(excelBytes, 
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized grades export attempt");
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting all grades to Excel");
            return StatusCode(500, "An error occurred while exporting your grades");
        }
    }

    #endregion

    #region Attendance Exports

    /// <summary>
    /// Export student's attendance records to CSV format
    /// </summary>
    /// <param name="filter">Optional filter parameters</param>
    /// <returns>CSV file download</returns>
    [HttpGet("attendance/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportAttendanceToCsv([FromQuery] StudentAttendanceExportRequest? filter)
    {
        try
        {
            var studentId = GetCurrentStudentId();
            _logger.LogInformation("Student {StudentId} requesting attendance CSV export", studentId);

            var csvBytes = await _studentExportService.ExportAttendanceToCsvAsync(studentId, filter);
            
            var fileName = $"attendance_{DateTime.Now:yyyyMMdd_HHmmss}.csv";
            return File(csvBytes, "text/csv", fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized attendance export attempt");
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting attendance to CSV");
            return StatusCode(500, "An error occurred while exporting your attendance");
        }
    }

    /// <summary>
    /// Export student's attendance records to Excel format
    /// </summary>
    /// <param name="filter">Optional filter parameters</param>
    /// <returns>Excel file download</returns>
    [HttpGet("attendance/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportAttendanceToExcel([FromQuery] StudentAttendanceExportRequest? filter)
    {
        try
        {
            var studentId = GetCurrentStudentId();
            _logger.LogInformation("Student {StudentId} requesting attendance Excel export", studentId);

            var excelBytes = await _studentExportService.ExportAttendanceToExcelAsync(studentId, filter);
            
            var fileName = $"attendance_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            return File(excelBytes, 
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized attendance export attempt");
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting attendance to Excel");
            return StatusCode(500, "An error occurred while exporting your attendance");
        }
    }

    #endregion

    #region Combined Reports

    /// <summary>
    /// Export a comprehensive academic report including grades, attendance and performance
    /// </summary>
    /// <param name="semester">Optional semester filter</param>
    /// <returns>Excel file download</returns>
    [HttpGet("academic-report/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ExportAcademicReportToExcel([FromQuery] int? semester)
    {
        try
        {
            var studentId = GetCurrentStudentId();
            _logger.LogInformation("Student {StudentId} requesting academic report Excel export, semester: {Semester}", 
                studentId, semester);

            var excelBytes = await _studentExportService.ExportAcademicReportToExcelAsync(studentId, semester);
            
            var semesterSuffix = semester.HasValue ? $"_sem{semester}" : "";
            var fileName = $"academic_report{semesterSuffix}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
            return File(excelBytes, 
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                fileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized academic report export attempt");
            return Unauthorized(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting academic report to Excel");
            return StatusCode(500, "An error occurred while exporting your academic report");
        }
    }

    #endregion
}
