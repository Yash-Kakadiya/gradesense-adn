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
    [Authorize(Roles = "Admin,Faculty")]
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
        [ProducesResponseType(typeof(ApiResponse<StudentDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<StudentDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<StudentDetailResponse>>> GetById(int id)
        {
            try
            {
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
        /// Create a new student
        /// </summary>
        [HttpPost]
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
        /// Download CSV import template
        /// </summary>
        [HttpGet("import/template")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetImportTemplate()
        {
            try
            {
                var csvBytes = await _studentService.GetImportTemplateAsync();
                return File(csvBytes, "text/csv", "student_import_template.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating student import template");
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while generating template"
                ));
            }
        }

        #endregion
    }
}