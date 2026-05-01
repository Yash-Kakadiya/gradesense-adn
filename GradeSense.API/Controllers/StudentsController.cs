using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Student.Request;
using GradeSense.API.DTOs.Student.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentService _studentService;
        private readonly ILogger<StudentsController> _logger;
        private readonly IAuditLogger _auditLogger;

        public StudentsController(
            IStudentService studentService,
            ILogger<StudentsController> logger,
            IAuditLogger auditLogger)
        {
            _studentService = studentService;
            _logger = logger;
            _auditLogger = auditLogger;
        }

        /// <summary>
        /// Get all students with filtering and pagination
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<StudentListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<StudentListResponse>>>> GetAll(
            [FromQuery] StudentFilterRequest filter)
        {
            try
            {
                var result = await _studentService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<StudentListResponse>>.SuccessResponse(
                    result,
                    "Students retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving students");
                return StatusCode(500, ApiResponse<PagedResponse<StudentListResponse>>.ErrorResponse(
                    "An error occurred while retrieving students"
                ));
            }
        }

        /// <summary>
        /// Get student by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        [ProducesResponseType(typeof(ApiResponse<StudentDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<StudentDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<StudentDetailResponse>>> GetById(int id)
        {
            try
            {
                // Students can only view their own profile
                if (User.IsInRole("Student"))
                {
                    var userIdClaim = User.FindFirst("sub")?.Value;
                    if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var studentId) || id != studentId)
                    {
                        return Forbid();
                    }
                }

                var student = await _studentService.GetByIdAsync(id);
                if (student == null)
                {
                    return NotFound(ApiResponse<StudentDetailResponse>.ErrorResponse(
                        $"Student with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<StudentDetailResponse>.SuccessResponse(
                    student,
                    "Student retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student {StudentId}", id);
                return StatusCode(500, ApiResponse<StudentDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the student"
                ));
            }
        }

        /// <summary>
        /// Get current logged-in student's profile
        /// </summary>
        [HttpGet("me")]
        [Authorize(Roles = "Student")]
        [ProducesResponseType(typeof(ApiResponse<StudentDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<StudentDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<StudentDetailResponse>>> GetMyProfile()
        {
            try
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var studentId))
                {
                    return Unauthorized(ApiResponse<StudentDetailResponse>.ErrorResponse("User ID not found in token"));
                }

                var student = await _studentService.GetByIdAsync(studentId);
                if (student == null)
                {
                    return NotFound(ApiResponse<StudentDetailResponse>.ErrorResponse(
                        "Student profile not found"
                    ));
                }

                return Ok(ApiResponse<StudentDetailResponse>.SuccessResponse(
                    student,
                    "Student profile retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student profile for current user");
                return StatusCode(500, ApiResponse<StudentDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving your profile"
                ));
            }
        }

        /// <summary>
        /// Create a new student
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<StudentResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<StudentResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<StudentResponse>>> Create(
            [FromBody] CreateStudentRequest request)
        {
            try
            {
                var student = await _studentService.CreateAsync(request);

                // Create audit log
                await _auditLogger.LogAsync("Create", "Student", student.Id.ToString(), $"Created student: {student.EnrollmentNumber}");

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = student.Id },
                    ApiResponse<StudentResponse>.SuccessResponse(
                        student,
                        "Student created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<StudentResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<StudentResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating student");
                return StatusCode(500, ApiResponse<StudentResponse>.ErrorResponse(
                    "An error occurred while creating the student"
                ));
            }
        }

        /// <summary>
        /// Update an existing student
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<StudentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<StudentResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<StudentResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<StudentResponse>>> Update(
            int id,
            [FromBody] UpdateStudentRequest request)
        {
            try
            {
                // Get old data for audit trail
                var oldStudent = await _studentService.GetByIdAsync(id);
                if (oldStudent == null)
                {
                    return NotFound(ApiResponse<StudentResponse>.ErrorResponse(
                        $"Student with ID {id} not found"
                    ));
                }

                var student = await _studentService.UpdateAsync(id, request);

                // Create audit log with change tracking
                await _auditLogger.LogUpdateAsync("Student", id.ToString(), oldStudent, student, $"Updated student: {student.EnrollmentNumber}");

                return Ok(ApiResponse<StudentResponse>.SuccessResponse(
                    student,
                    "Student updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<StudentResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<StudentResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating student {StudentId}", id);
                return StatusCode(500, ApiResponse<StudentResponse>.ErrorResponse(
                    "An error occurred while updating the student"
                ));
            }
        }

        /// <summary>
        /// Delete a student (soft delete)
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
                var result = await _studentService.DeleteAsync(id);

                // Create audit log
                await _auditLogger.LogAsync("Delete", "Student", id.ToString(), "Deleted student");

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Student deleted successfully"
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
                _logger.LogError(ex, "Error deleting student {StudentId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the student"
                ));
            }
        }

        #region Bulk Operations

        /// <summary>
        /// Import students from CSV file
        /// </summary>
        /// <remarks>
        /// CSV Format: Email, FullName, Password, EnrollmentNumber, AdmissionYear, CurrentSemester, DepartmentCode, Status, CGPA
        /// </remarks>
        [HttpPost("import/csv")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<BulkOperationResponse<StudentResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BulkOperationResponse<StudentResponse>>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkOperationResponse<StudentResponse>>>> ImportFromCsv(
            IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(ApiResponse<BulkOperationResponse<StudentResponse>>.ErrorResponse(
                        "No file uploaded"
                    ));
                }

                if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<BulkOperationResponse<StudentResponse>>.ErrorResponse(
                        "Only CSV files are allowed"
                    ));
                }

                using var stream = file.OpenReadStream();
                var result = await _studentService.BulkImportFromCsvAsync(stream);

                var message = result.IsSuccess
                    ? $"Import completed successfully. {result.SuccessCount} students created."
                    : $"Import completed with errors. {result.SuccessCount} succeeded, {result.ErrorCount} failed.";

                return Ok(ApiResponse<BulkOperationResponse<StudentResponse>>.SuccessResponse(
                    result,
                    message
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing students from CSV");
                return StatusCode(500, ApiResponse<BulkOperationResponse<StudentResponse>>.ErrorResponse(
                    "An error occurred while importing students"
                ));
            }
        }

        /// <summary>
        /// Export students to CSV file
        /// </summary>
        [HttpGet("export/csv")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        public async Task<IActionResult> ExportToCsv([FromQuery] StudentExportFilterRequest filter)
        {
            try
            {
                var csvBytes = await _studentService.ExportToCsvAsync(filter);
                var fileName = $"students_export_{DateTime.Now:yyyyMMdd_HHmmss}.csv";

                return File(csvBytes, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting students to CSV");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while exporting students"
                ));
            }
        }

        /// <summary>
        /// Download student import template (Excel)
        /// </summary>
        [HttpGet("import/template")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetImportTemplate()
        {
            try
            {
                var templateBytes = await _studentService.GetStudentImportTemplateAsync();
                return File(templateBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "student_import_template.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating student import template");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while generating template"
                ));
            }
        }

        /// <summary>
        /// Validate student import file
        /// </summary>
        /// <param name="file">Excel or CSV file</param>
        /// <returns>Validation results with preview</returns>
        [HttpPost("import/validate")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<BulkStudentValidationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkStudentValidationResponse>>> ValidateImport(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(ApiResponse<BulkStudentValidationResponse>.ErrorResponse("No file uploaded"));
                }

                var extension = Path.GetExtension(file.FileName).ToLower();
                if (extension != ".xlsx" && extension != ".xls" && extension != ".csv")
                {
                    return BadRequest(ApiResponse<BulkStudentValidationResponse>.ErrorResponse("Invalid file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are supported"));
                }

                using var stream = file.OpenReadStream();
                var result = await _studentService.ValidateStudentImportAsync(stream, extension);

                return Ok(ApiResponse<BulkStudentValidationResponse>.SuccessResponse(
                    result,
                    "File validated successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating student import file");
                return StatusCode(500, ApiResponse<BulkStudentValidationResponse>.ErrorResponse(
                    "An error occurred while validating the file"
                ));
            }
        }

        /// <summary>
        /// Execute student import
        /// </summary>
        /// <param name="request">Import request with validated rows</param>
        /// <returns>Import results</returns>
        [HttpPost("import/execute")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<BulkOperationResponse<StudentResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkOperationResponse<StudentResponse>>>> ExecuteImport([FromBody] BulkStudentImportRequest request)
        {
            try
            {
                if (request.Rows == null || !request.Rows.Any())
                {
                    return BadRequest(ApiResponse<BulkOperationResponse<StudentResponse>>.ErrorResponse("No rows to import"));
                }

                var result = await _studentService.ImportStudentsWithValidationAsync(request);

                // Create audit log
                await _auditLogger.LogAsync("BulkImport", "Student", null, $"Bulk imported {result.SuccessCount} students, {result.ErrorCount} errors");

                return Ok(ApiResponse<BulkOperationResponse<StudentResponse>>.SuccessResponse(
                    result,
                    $"Import completed: {result.SuccessCount} successful, {result.ErrorCount} errors"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing student import");
                return StatusCode(500, ApiResponse<BulkOperationResponse<StudentResponse>>.ErrorResponse(
                    "An error occurred while importing students"
                ));
            }
        }

        #endregion
    }
}