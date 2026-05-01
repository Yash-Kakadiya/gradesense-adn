using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Faculty.Request;
using GradeSense.API.DTOs.Faculty.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Student")]
    public class FacultiesController : ControllerBase
    {
        private readonly IFacultyService _facultyService;
        private readonly ILogger<FacultiesController> _logger;
        private readonly IAuditLogger _auditLogger;

        public FacultiesController(
            IFacultyService facultyService,
            ILogger<FacultiesController> logger,
            IAuditLogger auditLogger)
        {
            _facultyService = facultyService;
            _logger = logger;
            _auditLogger = auditLogger;
        }

        /// <summary>
        /// Get all faculties with filtering and pagination
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Student")]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<FacultyListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<FacultyListResponse>>>> GetAll(
            [FromQuery] FacultyFilterRequest filter)
        {
            try
            {
                var result = await _facultyService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<FacultyListResponse>>.SuccessResponse(
                    result,
                    "Faculties retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculties");
                return StatusCode(500, ApiResponse<PagedResponse<FacultyListResponse>>.ErrorResponse(
                    "An error occurred while retrieving faculties"
                ));
            }
        }

        /// <summary>
        /// Get faculty by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<FacultyDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<FacultyDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<FacultyDetailResponse>>> GetById(int id)
        {
            try
            {
                var faculty = await _facultyService.GetByIdAsync(id);
                if (faculty == null)
                {
                    return NotFound(ApiResponse<FacultyDetailResponse>.ErrorResponse(
                        $"Faculty with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<FacultyDetailResponse>.SuccessResponse(
                    faculty,
                    "Faculty retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculty {FacultyId}", id);
                return StatusCode(500, ApiResponse<FacultyDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the faculty"
                ));
            }
        }

        /// <summary>
        /// Create a new faculty
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<FacultyResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<FacultyResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<FacultyResponse>>> Create(
            [FromBody] CreateFacultyRequest request)
        {
            try
            {
                var faculty = await _facultyService.CreateAsync(request);

                // Create audit log
                await _auditLogger.LogAsync("Create", "Faculty", faculty.Id.ToString(), $"Created faculty: {faculty.EmployeeId}");

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = faculty.Id },
                    ApiResponse<FacultyResponse>.SuccessResponse(
                        faculty,
                        "Faculty created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<FacultyResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<FacultyResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating faculty");
                return StatusCode(500, ApiResponse<FacultyResponse>.ErrorResponse(
                    "An error occurred while creating the faculty"
                ));
            }
        }

        /// <summary>
        /// Update an existing faculty
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<FacultyResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<FacultyResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<FacultyResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<FacultyResponse>>> Update(
            int id,
            [FromBody] UpdateFacultyRequest request)
        {
            try
            {
                // Get old data for audit trail
                var oldFaculty = await _facultyService.GetByIdAsync(id);
                if (oldFaculty == null)
                {
                    return NotFound(ApiResponse<FacultyResponse>.ErrorResponse($"Faculty with ID {id} not found"));
                }

                var faculty = await _facultyService.UpdateAsync(id, request);

                // Create audit log with change tracking
                await _auditLogger.LogUpdateAsync("Faculty", id.ToString(), oldFaculty, faculty, $"Updated faculty: {faculty.EmployeeId}");

                return Ok(ApiResponse<FacultyResponse>.SuccessResponse(
                    faculty,
                    "Faculty updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<FacultyResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<FacultyResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating faculty {FacultyId}", id);
                return StatusCode(500, ApiResponse<FacultyResponse>.ErrorResponse(
                    "An error occurred while updating the faculty"
                ));
            }
        }

        /// <summary>
        /// Delete a faculty (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _facultyService.DeleteAsync(id);

                // Create audit log
                await _auditLogger.LogAsync("Delete", "Faculty", id.ToString(), "Deleted faculty");

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Faculty deleted successfully"
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
                _logger.LogError(ex, "Error deleting faculty {FacultyId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the faculty"
                ));
            }
        }

        #region Bulk Import

        /// <summary>
        /// Download faculty import template
        /// </summary>
        /// <returns>Excel template file</returns>
        [HttpGet("import/template")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetImportTemplate()
        {
            try
            {
                var templateBytes = await _facultyService.GetFacultyImportTemplateAsync();
                return File(templateBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "faculty_import_template.xlsx");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating faculty import template");
                return StatusCode(500, ApiResponse<string>.ErrorResponse("Failed to generate template"));
            }
        }

        /// <summary>
        /// Validate faculty import file
        /// </summary>
        /// <param name="file">Excel or CSV file</param>
        /// <returns>Validation results with preview</returns>
        [HttpPost("import/validate")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<BulkFacultyValidationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkFacultyValidationResponse>>> ValidateImport(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(ApiResponse<BulkFacultyValidationResponse>.ErrorResponse("No file uploaded"));
                }

                var extension = Path.GetExtension(file.FileName).ToLower();
                if (extension != ".xlsx" && extension != ".xls" && extension != ".csv")
                {
                    return BadRequest(ApiResponse<BulkFacultyValidationResponse>.ErrorResponse("Invalid file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are supported"));
                }

                using var stream = file.OpenReadStream();
                var result = await _facultyService.ValidateFacultyImportAsync(stream, extension);

                return Ok(ApiResponse<BulkFacultyValidationResponse>.SuccessResponse(
                    result,
                    "File validated successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating faculty import file");
                return StatusCode(500, ApiResponse<BulkFacultyValidationResponse>.ErrorResponse(
                    "An error occurred while validating the file"
                ));
            }
        }

        /// <summary>
        /// Execute faculty import
        /// </summary>
        /// <param name="request">Import request with validated rows</param>
        /// <returns>Import results</returns>
        [HttpPost("import/execute")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<BulkOperationResponse<FacultyResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkOperationResponse<FacultyResponse>>>> ExecuteImport([FromBody] BulkFacultyImportRequest request)
        {
            try
            {
                if (request.Rows == null || !request.Rows.Any())
                {
                    return BadRequest(ApiResponse<BulkOperationResponse<FacultyResponse>>.ErrorResponse("No rows to import"));
                }

                var result = await _facultyService.ImportFacultiesWithValidationAsync(request);

                // Create audit log
                await _auditLogger.LogAsync("BulkImport", "Faculty", null, $"Bulk imported {result.SuccessCount} faculties, {result.ErrorCount} errors");

                return Ok(ApiResponse<BulkOperationResponse<FacultyResponse>>.SuccessResponse(
                    result,
                    $"Import completed: {result.SuccessCount} successful, {result.ErrorCount} errors"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing faculty import");
                return StatusCode(500, ApiResponse<BulkOperationResponse<FacultyResponse>>.ErrorResponse(
                    "An error occurred while importing faculties"
                ));
            }
        }

        #endregion
    }
}