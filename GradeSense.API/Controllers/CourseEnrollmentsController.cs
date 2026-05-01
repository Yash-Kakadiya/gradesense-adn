using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.CourseEnrollment.Request;
using GradeSense.API.DTOs.CourseEnrollment.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CourseEnrollmentsController : ControllerBase
    {
        private readonly ICourseEnrollmentService _courseEnrollmentService;
        private readonly ILogger<CourseEnrollmentsController> _logger;
        private readonly IAuditLogger _auditLogger;

        public CourseEnrollmentsController(
            ICourseEnrollmentService courseEnrollmentService,
            ILogger<CourseEnrollmentsController> logger,
            IAuditLogger auditLogger)
        {
            _courseEnrollmentService = courseEnrollmentService;
            _logger = logger;
            _auditLogger = auditLogger;
        }

        /// <summary>
        /// Get all course enrollments with filtering and pagination
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Faculty,Student")]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<CourseEnrollmentListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<CourseEnrollmentListResponse>>>> GetAll(
            [FromQuery] CourseEnrollmentFilterRequest filter)
        {
            try
            {
                // Students can only see their own enrollments
                if (User.IsInRole("Student"))
                {
                    var userIdClaim = User.FindFirst("sub")?.Value;
                    if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var studentId))
                    {
                        return Forbid();
                    }
                    filter.StudentId = studentId;
                }

                var result = await _courseEnrollmentService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<CourseEnrollmentListResponse>>.SuccessResponse(
                    result,
                    "Course enrollments retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course enrollments");
                return StatusCode(500, ApiResponse<PagedResponse<CourseEnrollmentListResponse>>.ErrorResponse(
                    "An error occurred while retrieving course enrollments"
                ));
            }
        }

        /// <summary>
        /// Get course enrollment by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<CourseEnrollmentDetailResponse>>> GetById(int id)
        {
            try
            {
                var courseEnrollment = await _courseEnrollmentService.GetByIdAsync(id);
                if (courseEnrollment == null)
                {
                    return NotFound(ApiResponse<CourseEnrollmentDetailResponse>.ErrorResponse(
                        $"Course enrollment with ID {id} not found"
                    ));
                }

                // Students can only view their own enrollments
                if (User.IsInRole("Student"))
                {
                    var userIdClaim = User.FindFirst("sub")?.Value;
                    if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var studentId) || courseEnrollment.StudentId != studentId)
                    {
                        return Forbid();
                    }
                }

                return Ok(ApiResponse<CourseEnrollmentDetailResponse>.SuccessResponse(
                    courseEnrollment,
                    "Course enrollment retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course enrollment {CourseEnrollmentId}", id);
                return StatusCode(500, ApiResponse<CourseEnrollmentDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the course enrollment"
                ));
            }
        }

        /// <summary>
        /// Create a new course enrollment
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<CourseEnrollmentResponse>>> Create(
            [FromBody] CreateCourseEnrollmentRequest request)
        {
            try
            {
                var courseEnrollment = await _courseEnrollmentService.CreateAsync(request);

                await _auditLogger.LogAsync("Create", "CourseEnrollment", courseEnrollment.Id.ToString(), 
                    $"Enrolled student {request.StudentId} to course offering {request.CourseOfferingId}");

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = courseEnrollment.Id },
                    ApiResponse<CourseEnrollmentResponse>.SuccessResponse(
                        courseEnrollment,
                        "Course enrollment created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<CourseEnrollmentResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<CourseEnrollmentResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating course enrollment");
                return StatusCode(500, ApiResponse<CourseEnrollmentResponse>.ErrorResponse(
                    "An error occurred while creating the course enrollment"
                ));
            }
        }

        /// <summary>
        /// Bulk enroll students to a course offering
        /// </summary>
        [HttpPost("bulk")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<BulkEnrollResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BulkEnrollResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkEnrollResponse>>> BulkEnroll(
            [FromBody] BulkEnrollRequest request)
        {
            try
            {
                if (request.StudentIds == null || request.StudentIds.Count == 0)
                {
                    return BadRequest(ApiResponse<BulkEnrollResponse>.ErrorResponse("At least one student ID is required"));
                }

                var result = await _courseEnrollmentService.BulkEnrollAsync(request);

                await _auditLogger.LogAsync("BulkCreate", "CourseEnrollment", 
                    $"offering-{request.CourseOfferingId}", 
                    $"Bulk enrolled {result.SuccessfulEnrollments} of {result.TotalRequested} students to course offering {request.CourseOfferingId}");

                var message = result.SuccessfulEnrollments > 0
                    ? $"Successfully enrolled {result.SuccessfulEnrollments} of {result.TotalRequested} students"
                    : "No students were enrolled";

                return Ok(ApiResponse<BulkEnrollResponse>.SuccessResponse(result, message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during bulk enrollment");
                return StatusCode(500, ApiResponse<BulkEnrollResponse>.ErrorResponse(
                    "An error occurred during bulk enrollment"
                ));
            }
        }

        /// <summary>
        /// Update an existing course enrollment
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<CourseEnrollmentResponse>>> Update(
            int id,
            [FromBody] UpdateCourseEnrollmentRequest request)
        {
            try
            {
                var oldEnrollment = await _courseEnrollmentService.GetByIdAsync(id);
                var courseEnrollment = await _courseEnrollmentService.UpdateAsync(id, request);

                if (oldEnrollment != null)
                    await _auditLogger.LogUpdateAsync("CourseEnrollment", id.ToString(), oldEnrollment, courseEnrollment, "Updated course enrollment");

                return Ok(ApiResponse<CourseEnrollmentResponse>.SuccessResponse(
                    courseEnrollment,
                    "Course enrollment updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<CourseEnrollmentResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<CourseEnrollmentResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating course enrollment {CourseEnrollmentId}", id);
                return StatusCode(500, ApiResponse<CourseEnrollmentResponse>.ErrorResponse(
                    "An error occurred while updating the course enrollment"
                ));
            }
        }

        /// <summary>
        /// Delete a course enrollment (soft delete)
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
                var result = await _courseEnrollmentService.DeleteAsync(id);

                await _auditLogger.LogAsync("Delete", "CourseEnrollment", id.ToString(), "Deleted course enrollment (with cascade delete of marks, attendance, and predictions)");

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Course enrollment deleted successfully"
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
                _logger.LogError(ex, "Error deleting course enrollment {CourseEnrollmentId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the course enrollment"
                ));
            }
        }

        #region Bulk Import Endpoints

        /// <summary>
        /// Download Excel template for student enrollment import
        /// </summary>
        /// <remarks>
        /// Returns an Excel template with example roll numbers for bulk enrollment
        /// </remarks>
        [HttpGet("import/template/excel/{courseOfferingId}")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetEnrollmentTemplateExcel(int courseOfferingId)
        {
            try
            {
                var excelBytes = await _courseEnrollmentService.GetEnrollmentTemplateExcelAsync(courseOfferingId);
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"enrollment_template_course_{courseOfferingId}.xlsx");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating enrollment template for course offering {CourseOfferingId}", courseOfferingId);
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while generating template"
                ));
            }
        }

        /// <summary>
        /// Validate enrollment import file and return preview with conflicts
        /// </summary>
        /// <remarks>
        /// Accepts Excel (.xlsx) or CSV (.csv) files.
        /// Returns validation results with conflict detection for existing enrollments.
        /// </remarks>
        [HttpPost("import/validate")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<BulkEnrollmentValidationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BulkEnrollmentValidationResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkEnrollmentValidationResponse>>> ValidateEnrollmentImport(
            [FromQuery] int courseOfferingId,
            IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(ApiResponse<BulkEnrollmentValidationResponse>.ErrorResponse("No file uploaded"));
                }

                var extension = Path.GetExtension(file.FileName).ToLower();
                if (extension != ".csv" && extension != ".xlsx" && extension != ".xls")
                {
                    return BadRequest(ApiResponse<BulkEnrollmentValidationResponse>.ErrorResponse(
                        "Only CSV and Excel files are supported"
                    ));
                }

                using var stream = file.OpenReadStream();
                var result = await _courseEnrollmentService.ValidateEnrollmentImportAsync(courseOfferingId, stream, extension);

                return Ok(ApiResponse<BulkEnrollmentValidationResponse>.SuccessResponse(
                    result,
                    $"Validation complete: {result.ValidRows} valid, {result.InvalidRows} invalid, {result.ConflictRows} conflicts"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<BulkEnrollmentValidationResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating enrollment import");
                return StatusCode(500, ApiResponse<BulkEnrollmentValidationResponse>.ErrorResponse(
                    "An error occurred while validating import file"
                ));
            }
        }

        /// <summary>
        /// Import student enrollments with validation and conflict resolution
        /// </summary>
        /// <remarks>
        /// Import enrollments with specified conflict resolution strategy: Skip, Update (re-activate), or Error
        /// </remarks>
        [HttpPost("import/execute")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<BulkOperationResponse<CourseEnrollmentResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BulkOperationResponse<CourseEnrollmentResponse>>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkOperationResponse<CourseEnrollmentResponse>>>> ExecuteEnrollmentImport(
            [FromBody] BulkEnrollmentImportRequest request)
        {
            try
            {
                if (request.Rows == null || request.Rows.Count == 0)
                {
                    return BadRequest(ApiResponse<BulkOperationResponse<CourseEnrollmentResponse>>.ErrorResponse(
                        "No enrollment data provided"
                    ));
                }

                var result = await _courseEnrollmentService.ImportEnrollmentsWithValidationAsync(request);

                await _auditLogger.LogAsync("BulkImport", "CourseEnrollment",
                    $"offering-{request.CourseOfferingId}",
                    $"Bulk imported {result.SuccessCount} enrollments, {result.ErrorCount} failed");

                var message = result.IsSuccess
                    ? $"Import completed successfully. {result.SuccessCount} students enrolled."
                    : $"Import completed with errors. {result.SuccessCount} succeeded, {result.ErrorCount} failed.";

                return Ok(ApiResponse<BulkOperationResponse<CourseEnrollmentResponse>>.SuccessResponse(result, message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<BulkOperationResponse<CourseEnrollmentResponse>>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<BulkOperationResponse<CourseEnrollmentResponse>>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing enrollment import");
                return StatusCode(500, ApiResponse<BulkOperationResponse<CourseEnrollmentResponse>>.ErrorResponse(
                    "An error occurred while importing enrollments"
                ));
            }
        }

        #endregion
    }
}