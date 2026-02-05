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
    [Authorize(Roles = "Admin,Faculty")]
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
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<StudentMarkListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<StudentMarkListResponse>>>> GetAll(
            [FromQuery] StudentMarkFilterRequest filter)
        {
            try
            {
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

        #region Bulk Operations

        /// <summary>
        /// Import grades from CSV file for a specific assessment
        /// </summary>
        /// <remarks>
        /// CSV Format: EnrollmentNumber, ObtainedMarks, IsAbsent, Remarks
        /// </remarks>
        [HttpPost("import/csv")]
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

        #endregion
    }
}