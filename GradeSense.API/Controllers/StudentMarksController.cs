using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.StudentMark.Request;
using GradeSense.API.DTOs.StudentMark.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudentMarksController : ControllerBase
    {
        private readonly IStudentMarkService _studentMarkService;
        private readonly ILogger<StudentMarksController> _logger;
        private readonly IAuditLogger _auditLogger;

        public StudentMarksController(
            IStudentMarkService studentMarkService,
            ILogger<StudentMarksController> logger,
            IAuditLogger auditLogger)
        {
            _studentMarkService = studentMarkService;
            _logger = logger;
            _auditLogger = auditLogger;
        }

        /// <summary>
        /// Get all student marks with filtering and pagination
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Faculty,Student")]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<StudentMarkListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<StudentMarkListResponse>>>> GetAll(
            [FromQuery] StudentMarkFilterRequest filter)
        {
            try
            {
                // Students can only see their own marks
                if (User.IsInRole("Student"))
                {
                    var userIdClaim = User.FindFirst("sub")?.Value;
                    if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var studentId))
                    {
                        return Forbid();
                    }
                    filter.StudentId = studentId;
                }

                var result = await _studentMarkService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<StudentMarkListResponse>>.SuccessResponse(
                    result,
                    "Student marks retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student marks");
                return StatusCode(500, ApiResponse<PagedResponse<StudentMarkListResponse>>.ErrorResponse(
                    "An error occurred while retrieving student marks"
                ));
            }
        }

        /// <summary>
        /// Get student mark by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<StudentMarkDetailResponse>>> GetById(int id)
        {
            try
            {
                var studentMark = await _studentMarkService.GetByIdAsync(id);
                if (studentMark == null)
                {
                    return NotFound(ApiResponse<StudentMarkDetailResponse>.ErrorResponse(
                        $"Student mark with ID {id} not found"
                    ));
                }

                // Students can only view their own marks
                if (User.IsInRole("Student"))
                {
                    var userIdClaim = User.FindFirst("sub")?.Value;
                    if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var studentId) || studentMark.StudentId != studentId)
                    {
                        return Forbid();
                    }
                }

                return Ok(ApiResponse<StudentMarkDetailResponse>.SuccessResponse(
                    studentMark,
                    "Student mark retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student mark {StudentMarkId}", id);
                return StatusCode(500, ApiResponse<StudentMarkDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the student mark"
                ));
            }
        }

        /// <summary>
        /// Create a new student mark
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<StudentMarkResponse>>> Create(
            [FromBody] CreateStudentMarkRequest request)
        {
            try
            {
                var studentMark = await _studentMarkService.CreateAsync(request);

                // Create audit log
                await _auditLogger.LogAsync("Create", "StudentMark", studentMark.Id.ToString(), $"Created student mark");

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = studentMark.Id },
                    ApiResponse<StudentMarkResponse>.SuccessResponse(
                        studentMark,
                        "Student mark created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<StudentMarkResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<StudentMarkResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating student mark");
                return StatusCode(500, ApiResponse<StudentMarkResponse>.ErrorResponse(
                    "An error occurred while creating the student mark"
                ));
            }
        }

        /// <summary>
        /// Update an existing student mark
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<StudentMarkResponse>>> Update(
            int id,
            [FromBody] UpdateStudentMarkRequest request)
        {
            try
            {
                // Get old data for audit trail
                var oldStudentMark = await _studentMarkService.GetByIdAsync(id);
                if (oldStudentMark == null)
                {
                    return NotFound(ApiResponse<StudentMarkResponse>.ErrorResponse($"Student mark with ID {id} not found"));
                }

                var studentMark = await _studentMarkService.UpdateAsync(id, request);

                // Create audit log with change tracking
                await _auditLogger.LogUpdateAsync("StudentMark", id.ToString(), oldStudentMark, studentMark, "Updated student mark");

                return Ok(ApiResponse<StudentMarkResponse>.SuccessResponse(
                    studentMark,
                    "Student mark updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<StudentMarkResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<StudentMarkResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating student mark {StudentMarkId}", id);
                return StatusCode(500, ApiResponse<StudentMarkResponse>.ErrorResponse(
                    "An error occurred while updating the student mark"
                ));
            }
        }

        /// <summary>
        /// Delete a student mark (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _studentMarkService.DeleteAsync(id);

                // Create audit log
                await _auditLogger.LogAsync("Delete", "StudentMark", id.ToString(), "Deleted student mark");

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Student mark deleted successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting student mark {StudentMarkId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the student mark"
                ));
            }
        }

        /// <summary>
        /// Bulk entry for student marks
        /// </summary>
        /// <remarks>
        /// Submit marks for multiple students for a specific assessment
        /// </remarks>
        [HttpPost("bulk")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<BulkStudentMarkResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BulkStudentMarkResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkStudentMarkResponse>>> BulkEntry(
            [FromBody] BulkStudentMarkRequest request)
        {
            try
            {
                if (request.Marks == null || request.Marks.Count == 0)
                {
                    return BadRequest(ApiResponse<BulkStudentMarkResponse>.ErrorResponse("At least one mark entry is required"));
                }

                var result = await _studentMarkService.BulkEntrySaveAsync(request);

                var message = result.SuccessfulEntries > 0
                    ? $"Successfully saved {result.SuccessfulEntries} of {result.TotalRequested} marks"
                    : "No marks were saved";

                return Ok(ApiResponse<BulkStudentMarkResponse>.SuccessResponse(result, message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<BulkStudentMarkResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<BulkStudentMarkResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during bulk grade entry");
                return StatusCode(500, ApiResponse<BulkStudentMarkResponse>.ErrorResponse(
                    "An error occurred during bulk grade entry"
                ));
            }
        }

        #region Bulk Operations

        /// <summary>
        /// Import grades from CSV file for a specific assessment
        /// </summary>
        /// <remarks>
        /// CSV Format: EnrollmentNumber, ObtainedMarks, IsAbsent, Remarks
        /// </remarks>
        [HttpPost("import/csv")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<BulkOperationResponse<StudentMarkResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BulkOperationResponse<StudentMarkResponse>>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkOperationResponse<StudentMarkResponse>>>> ImportGradesFromCsv(
            [FromQuery] int assessmentItemId,
            [FromQuery] int graderId,
            IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(ApiResponse<BulkOperationResponse<StudentMarkResponse>>.ErrorResponse(
                        "No file uploaded"
                    ));
                }

                if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<BulkOperationResponse<StudentMarkResponse>>.ErrorResponse(
                        "Only CSV files are allowed"
                    ));
                }

                using var stream = file.OpenReadStream();
                var result = await _studentMarkService.BulkImportGradesAsync(assessmentItemId, graderId, stream);

                var message = result.IsSuccess
                    ? $"Import completed successfully. {result.SuccessCount} grades recorded."
                    : $"Import completed with errors. {result.SuccessCount} succeeded, {result.ErrorCount} failed.";

                return Ok(ApiResponse<BulkOperationResponse<StudentMarkResponse>>.SuccessResponse(
                    result,
                    message
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<BulkOperationResponse<StudentMarkResponse>>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<BulkOperationResponse<StudentMarkResponse>>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing grades from CSV");
                return StatusCode(500, ApiResponse<BulkOperationResponse<StudentMarkResponse>>.ErrorResponse(
                    "An error occurred while importing grades"
                ));
            }
        }

        /// <summary>
        /// Export grades to CSV file
        /// </summary>
        [HttpGet("export/csv")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        public async Task<IActionResult> ExportGradesToCsv([FromQuery] StudentMarkExportFilterRequest filter)
        {
            try
            {
                var csvBytes = await _studentMarkService.ExportGradesToCsvAsync(filter);
                var fileName = $"grades_export_{DateTime.Now:yyyyMMdd_HHmmss}.csv";

                return File(csvBytes, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting grades to CSV");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while exporting grades"
                ));
            }
        }

        /// <summary>
        /// Download CSV template for grade entry
        /// </summary>
        /// <remarks>
        /// Returns a CSV template pre-filled with enrolled students for the assessment
        /// </remarks>
        [HttpGet("import/template/{assessmentItemId}")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetGradeTemplate(int assessmentItemId)
        {
            try
            {
                var csvBytes = await _studentMarkService.GetGradeTemplateAsync(assessmentItemId);
                return File(csvBytes, "text/csv", $"grade_template_assessment_{assessmentItemId}.csv");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating grade template for assessment {AssessmentItemId}", assessmentItemId);
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while generating template"
                ));
            }
        }

        /// <summary>
        /// Download Excel template for grade entry
        /// </summary>
        [HttpGet("import/template/excel/{assessmentItemId}")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetGradeTemplateExcel(int assessmentItemId)
        {
            try
            {
                var excelBytes = await _studentMarkService.GetGradeTemplateExcelAsync(assessmentItemId);
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"grade_template_assessment_{assessmentItemId}.xlsx");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Excel grade template for assessment {AssessmentItemId}", assessmentItemId);
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while generating template"
                ));
            }
        }

        /// <summary>
        /// Validate grade import file and return preview with conflicts
        /// </summary>
        /// <remarks>
        /// Accepts Excel (.xlsx) or CSV (.csv) files.
        /// Returns validation results with conflict detection for existing marks.
        /// </remarks>
        [HttpPost("import/validate")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<BulkGradeValidationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BulkGradeValidationResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkGradeValidationResponse>>> ValidateGradeImport(
            [FromQuery] int assessmentItemId,
            IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(ApiResponse<BulkGradeValidationResponse>.ErrorResponse("No file uploaded"));
                }

                var extension = Path.GetExtension(file.FileName).ToLower();
                if (extension != ".csv" && extension != ".xlsx" && extension != ".xls")
                {
                    return BadRequest(ApiResponse<BulkGradeValidationResponse>.ErrorResponse(
                        "Only CSV and Excel files are supported"
                    ));
                }

                using var stream = file.OpenReadStream();
                var result = await _studentMarkService.ValidateGradeImportAsync(assessmentItemId, stream, extension);

                return Ok(ApiResponse<BulkGradeValidationResponse>.SuccessResponse(
                    result,
                    $"Validation complete: {result.ValidRows} valid, {result.InvalidRows} invalid, {result.ConflictRows} conflicts"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<BulkGradeValidationResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating grade import");
                return StatusCode(500, ApiResponse<BulkGradeValidationResponse>.ErrorResponse(
                    "An error occurred while validating import file"
                ));
            }
        }

        /// <summary>
        /// Import grades with validation and conflict resolution
        /// </summary>
        /// <remarks>
        /// Import grades with specified conflict resolution strategy: Skip, Update, or Error
        /// </remarks>
        [HttpPost("import/execute")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<BulkOperationResponse<StudentMarkResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BulkOperationResponse<StudentMarkResponse>>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkOperationResponse<StudentMarkResponse>>>> ExecuteGradeImport(
            [FromBody] BulkGradeImportRequest request)
        {
            try
            {
                if (request.Rows == null || request.Rows.Count == 0)
                {
                    return BadRequest(ApiResponse<BulkOperationResponse<StudentMarkResponse>>.ErrorResponse(
                        "No grade data provided"
                    ));
                }

                var result = await _studentMarkService.ImportGradesWithValidationAsync(request);

                var message = result.IsSuccess
                    ? $"Import completed successfully. {result.SuccessCount} grades recorded."
                    : $"Import completed with errors. {result.SuccessCount} succeeded, {result.ErrorCount} failed.";

                return Ok(ApiResponse<BulkOperationResponse<StudentMarkResponse>>.SuccessResponse(result, message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<BulkOperationResponse<StudentMarkResponse>>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<BulkOperationResponse<StudentMarkResponse>>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing grade import");
                return StatusCode(500, ApiResponse<BulkOperationResponse<StudentMarkResponse>>.ErrorResponse(
                    "An error occurred while importing grades"
                ));
            }
        }

        #endregion
    }
}