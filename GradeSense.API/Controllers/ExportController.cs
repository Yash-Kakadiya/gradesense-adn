using GradeSense.API.DTOs.Export;
using GradeSense.API.DTOs.Student.Request;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers;

/// <summary>
/// Controller for data export functionality (CSV and Excel)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ExportController : ControllerBase
{
    private readonly IExportService _exportService;
    private readonly ILogger<ExportController> _logger;

    public ExportController(IExportService exportService, ILogger<ExportController> logger)
    {
        _exportService = exportService;
        _logger = logger;
    }

    #region User Exports

    /// <summary>
    /// Export users to CSV (basic list data)
    /// </summary>
    [HttpGet("users/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportUsersToCsv([FromQuery] UserExportFilterRequest filter)
    {
        try
        {
            var csvBytes = await _exportService.ExportUsersToCsvAsync(filter);
            return File(csvBytes, "text/csv", $"users_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting users to CSV");
            return StatusCode(500, "An error occurred while exporting users");
        }
    }

    /// <summary>
    /// Export users to Excel (full detailed data)
    /// </summary>
    [HttpGet("users/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportUsersToExcel([FromQuery] UserExportFilterRequest filter)
    {
        try
        {
            var excelBytes = await _exportService.ExportUsersToExcelAsync(filter);
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                $"users_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting users to Excel");
            return StatusCode(500, "An error occurred while exporting users");
        }
    }

    #endregion

    #region Faculty Exports

    /// <summary>
    /// Export faculties to CSV (basic list data)
    /// </summary>
    [HttpGet("faculties/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportFacultiesToCsv([FromQuery] FacultyExportFilterRequest filter)
    {
        try
        {
            var csvBytes = await _exportService.ExportFacultiesToCsvAsync(filter);
            return File(csvBytes, "text/csv", $"faculties_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting faculties to CSV");
            return StatusCode(500, "An error occurred while exporting faculties");
        }
    }

    /// <summary>
    /// Export faculties to Excel (full detailed data)
    /// </summary>
    [HttpGet("faculties/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportFacultiesToExcel([FromQuery] FacultyExportFilterRequest filter)
    {
        try
        {
            var excelBytes = await _exportService.ExportFacultiesToExcelAsync(filter);
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                $"faculties_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting faculties to Excel");
            return StatusCode(500, "An error occurred while exporting faculties");
        }
    }

    #endregion

    #region Student Exports

    /// <summary>
    /// Export students to CSV (basic list data)
    /// </summary>
    [HttpGet("students/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportStudentsToCsv([FromQuery] StudentExportFilterRequest filter)
    {
        try
        {
            var csvBytes = await _exportService.ExportStudentsToCsvAsync(filter);
            return File(csvBytes, "text/csv", $"students_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting students to CSV");
            return StatusCode(500, "An error occurred while exporting students");
        }
    }

    /// <summary>
    /// Export students to Excel (full detailed data)
    /// </summary>
    [HttpGet("students/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportStudentsToExcel([FromQuery] StudentExportFilterRequest filter)
    {
        try
        {
            var excelBytes = await _exportService.ExportStudentsToExcelAsync(filter);
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                $"students_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting students to Excel");
            return StatusCode(500, "An error occurred while exporting students");
        }
    }

    #endregion

    #region Department Exports

    /// <summary>
    /// Export departments to CSV (basic list data)
    /// </summary>
    [HttpGet("departments/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportDepartmentsToCsv([FromQuery] DepartmentExportFilterRequest filter)
    {
        try
        {
            var csvBytes = await _exportService.ExportDepartmentsToCsvAsync(filter);
            return File(csvBytes, "text/csv", $"departments_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting departments to CSV");
            return StatusCode(500, "An error occurred while exporting departments");
        }
    }

    /// <summary>
    /// Export departments to Excel (full detailed data)
    /// </summary>
    [HttpGet("departments/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportDepartmentsToExcel([FromQuery] DepartmentExportFilterRequest filter)
    {
        try
        {
            var excelBytes = await _exportService.ExportDepartmentsToExcelAsync(filter);
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                $"departments_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting departments to Excel");
            return StatusCode(500, "An error occurred while exporting departments");
        }
    }

    #endregion

    #region Batch Exports

    /// <summary>
    /// Export batches to CSV (basic list data)
    /// </summary>
    [HttpGet("batches/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportBatchesToCsv([FromQuery] BatchExportFilterRequest filter)
    {
        try
        {
            var csvBytes = await _exportService.ExportBatchesToCsvAsync(filter);
            return File(csvBytes, "text/csv", $"batches_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting batches to CSV");
            return StatusCode(500, "An error occurred while exporting batches");
        }
    }

    /// <summary>
    /// Export batches to Excel (full detailed data)
    /// </summary>
    [HttpGet("batches/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportBatchesToExcel([FromQuery] BatchExportFilterRequest filter)
    {
        try
        {
            var excelBytes = await _exportService.ExportBatchesToExcelAsync(filter);
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                $"batches_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting batches to Excel");
            return StatusCode(500, "An error occurred while exporting batches");
        }
    }

    #endregion

    #region Subject Exports

    /// <summary>
    /// Export subjects to CSV (basic list data)
    /// </summary>
    [HttpGet("subjects/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportSubjectsToCsv([FromQuery] SubjectExportFilterRequest filter)
    {
        try
        {
            var csvBytes = await _exportService.ExportSubjectsToCsvAsync(filter);
            return File(csvBytes, "text/csv", $"subjects_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting subjects to CSV");
            return StatusCode(500, "An error occurred while exporting subjects");
        }
    }

    /// <summary>
    /// Export subjects to Excel (full detailed data)
    /// </summary>
    [HttpGet("subjects/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportSubjectsToExcel([FromQuery] SubjectExportFilterRequest filter)
    {
        try
        {
            var excelBytes = await _exportService.ExportSubjectsToExcelAsync(filter);
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                $"subjects_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting subjects to Excel");
            return StatusCode(500, "An error occurred while exporting subjects");
        }
    }

    #endregion

    #region Course Offering Exports

    /// <summary>
    /// Export course offerings to CSV (basic list data)
    /// </summary>
    [HttpGet("course-offerings/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportCourseOfferingsToCsv([FromQuery] CourseOfferingExportFilterRequest filter)
    {
        try
        {
            var csvBytes = await _exportService.ExportCourseOfferingsToCsvAsync(filter);
            return File(csvBytes, "text/csv", $"course_offerings_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting course offerings to CSV");
            return StatusCode(500, "An error occurred while exporting course offerings");
        }
    }

    /// <summary>
    /// Export course offerings to Excel (full detailed data)
    /// </summary>
    [HttpGet("course-offerings/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportCourseOfferingsToExcel([FromQuery] CourseOfferingExportFilterRequest filter)
    {
        try
        {
            var excelBytes = await _exportService.ExportCourseOfferingsToExcelAsync(filter);
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                $"course_offerings_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting course offerings to Excel");
            return StatusCode(500, "An error occurred while exporting course offerings");
        }
    }

    #endregion

    #region Evaluation Scheme Exports

    /// <summary>
    /// Export evaluation schemes to CSV (basic list data)
    /// </summary>
    [HttpGet("evaluation-schemes/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportEvaluationSchemesToCsv([FromQuery] EvaluationSchemeExportFilterRequest filter)
    {
        try
        {
            var csvBytes = await _exportService.ExportEvaluationSchemesToCsvAsync(filter);
            return File(csvBytes, "text/csv", $"evaluation_schemes_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting evaluation schemes to CSV");
            return StatusCode(500, "An error occurred while exporting evaluation schemes");
        }
    }

    /// <summary>
    /// Export evaluation schemes to Excel (full detailed data)
    /// </summary>
    [HttpGet("evaluation-schemes/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportEvaluationSchemesToExcel([FromQuery] EvaluationSchemeExportFilterRequest filter)
    {
        try
        {
            var excelBytes = await _exportService.ExportEvaluationSchemesToExcelAsync(filter);
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                $"evaluation_schemes_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting evaluation schemes to Excel");
            return StatusCode(500, "An error occurred while exporting evaluation schemes");
        }
    }

    #endregion

    #region Audit Log Exports

    /// <summary>
    /// Export audit logs to CSV (basic list data)
    /// </summary>
    [HttpGet("audit-logs/csv")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportAuditLogsToCsv([FromQuery] AuditLogExportFilterRequest filter)
    {
        try
        {
            var csvBytes = await _exportService.ExportAuditLogsToCsvAsync(filter);
            return File(csvBytes, "text/csv", $"audit_logs_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting audit logs to CSV");
            return StatusCode(500, "An error occurred while exporting audit logs");
        }
    }

    /// <summary>
    /// Export audit logs to Excel (full detailed data)
    /// </summary>
    [HttpGet("audit-logs/excel")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportAuditLogsToExcel([FromQuery] AuditLogExportFilterRequest filter)
    {
        try
        {
            var excelBytes = await _exportService.ExportAuditLogsToExcelAsync(filter);
            return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                $"audit_logs_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting audit logs to Excel");
            return StatusCode(500, "An error occurred while exporting audit logs");
        }
    }

    #endregion
}
