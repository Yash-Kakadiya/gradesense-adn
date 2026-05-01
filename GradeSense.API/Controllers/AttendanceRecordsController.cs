using GradeSense.API.DTOs.AttendanceRecord.Request;
using GradeSense.API.DTOs.AttendanceRecord.Response;
using GradeSense.API.DTOs.Common;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AttendanceRecordsController : ControllerBase
    {
        private readonly IAttendanceRecordService _attendanceRecordService;
        private readonly ILogger<AttendanceRecordsController> _logger;
        private readonly IAuditLogger _auditLogger;

        public AttendanceRecordsController(
            IAttendanceRecordService attendanceRecordService,
            ILogger<AttendanceRecordsController> logger,
            IAuditLogger auditLogger)
        {
            _attendanceRecordService = attendanceRecordService;
            _logger = logger;
            _auditLogger = auditLogger;
        }

        /// <summary>
        /// Get all attendance records with filtering and pagination
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Faculty,Student")]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<AttendanceRecordListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<AttendanceRecordListResponse>>>> GetAll(
            [FromQuery] AttendanceRecordFilterRequest filter)
        {
            try
            {
                // Students can only see their own attendance records
                if (User.IsInRole("Student"))
                {
                    var userIdClaim = User.FindFirst("sub")?.Value;
                    if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var studentId))
                    {
                        return Forbid();
                    }
                    filter.StudentId = studentId;
                }

                var result = await _attendanceRecordService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<AttendanceRecordListResponse>>.SuccessResponse(
                    result,
                    "Attendance records retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving attendance records");
                return StatusCode(500, ApiResponse<PagedResponse<AttendanceRecordListResponse>>.ErrorResponse(
                    "An error occurred while retrieving attendance records"
                ));
            }
        }

        /// <summary>
        /// Get attendance record by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        [ProducesResponseType(typeof(ApiResponse<AttendanceRecordDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<AttendanceRecordDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<AttendanceRecordDetailResponse>>> GetById(int id)
        {
            try
            {
                var attendanceRecord = await _attendanceRecordService.GetByIdAsync(id);
                if (attendanceRecord == null)
                {
                    return NotFound(ApiResponse<AttendanceRecordDetailResponse>.ErrorResponse(
                        $"Attendance record with ID {id} not found"
                    ));
                }

                // Students can only view their own attendance
                if (User.IsInRole("Student"))
                {
                    var userIdClaim = User.FindFirst("sub")?.Value;
                    if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var studentId) || attendanceRecord.StudentId != studentId)
                    {
                        return Forbid();
                    }
                }

                return Ok(ApiResponse<AttendanceRecordDetailResponse>.SuccessResponse(
                    attendanceRecord,
                    "Attendance record retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving attendance record {AttendanceRecordId}", id);
                return StatusCode(500, ApiResponse<AttendanceRecordDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the attendance record"
                ));
            }
        }

        /// <summary>
        /// Create a new attendance record
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<AttendanceRecordResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<AttendanceRecordResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<AttendanceRecordResponse>>> Create(
            [FromBody] CreateAttendanceRecordRequest request)
        {
            try
            {
                var attendanceRecord = await _attendanceRecordService.CreateAsync(request);

                await _auditLogger.LogAsync("Create", "AttendanceRecord", attendanceRecord.Id.ToString(), 
                    $"Marked attendance for enrollment {request.EnrollmentId} on {request.AttendanceDate}");

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = attendanceRecord.Id },
                    ApiResponse<AttendanceRecordResponse>.SuccessResponse(
                        attendanceRecord,
                        "Attendance record created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<AttendanceRecordResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<AttendanceRecordResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating attendance record");
                return StatusCode(500, ApiResponse<AttendanceRecordResponse>.ErrorResponse(
                    "An error occurred while creating the attendance record"
                ));
            }
        }

        /// <summary>
        /// Update an existing attendance record
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<AttendanceRecordResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<AttendanceRecordResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<AttendanceRecordResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<AttendanceRecordResponse>>> Update(
            int id,
            [FromBody] UpdateAttendanceRecordRequest request)
        {
            try
            {
                var oldRecord = await _attendanceRecordService.GetByIdAsync(id);
                var attendanceRecord = await _attendanceRecordService.UpdateAsync(id, request);

                if (oldRecord != null)
                    await _auditLogger.LogUpdateAsync("AttendanceRecord", id.ToString(), oldRecord, attendanceRecord, "Updated attendance record");

                return Ok(ApiResponse<AttendanceRecordResponse>.SuccessResponse(
                    attendanceRecord,
                    "Attendance record updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<AttendanceRecordResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<AttendanceRecordResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating attendance record {AttendanceRecordId}", id);
                return StatusCode(500, ApiResponse<AttendanceRecordResponse>.ErrorResponse(
                    "An error occurred while updating the attendance record"
                ));
            }
        }

        /// <summary>
        /// Delete an attendance record (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _attendanceRecordService.DeleteAsync(id);

                await _auditLogger.LogAsync("Delete", "AttendanceRecord", id.ToString(), "Deleted attendance record");

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Attendance record deleted successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting attendance record {AttendanceRecordId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the attendance record"
                ));
            }
        }

        /// <summary>
        /// Bulk mark attendance for multiple students
        /// </summary>
        /// <remarks>
        /// Mark attendance for multiple students for a specific date
        /// </remarks>
        [HttpPost("bulk")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<BulkAttendanceResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BulkAttendanceResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkAttendanceResponse>>> BulkMark(
            [FromBody] BulkAttendanceRequest request)
        {
            try
            {
                if (request.Records == null || request.Records.Count == 0)
                {
                    return BadRequest(ApiResponse<BulkAttendanceResponse>.ErrorResponse("At least one attendance record is required"));
                }

                var result = await _attendanceRecordService.BulkMarkAsync(request);

                await _auditLogger.LogAsync("BulkCreate", "AttendanceRecord", 
                    $"bulk-{request.Records?.Count ?? 0}", 
                    $"Bulk marked {result.SuccessfulEntries} attendance records");

                var message = result.SuccessfulEntries > 0
                    ? $"Successfully marked attendance for {result.SuccessfulEntries} of {result.TotalRequested} students"
                    : "No attendance records were saved";

                return Ok(ApiResponse<BulkAttendanceResponse>.SuccessResponse(result, message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<BulkAttendanceResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<BulkAttendanceResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during bulk attendance marking");
                return StatusCode(500, ApiResponse<BulkAttendanceResponse>.ErrorResponse(
                    "An error occurred during bulk attendance marking"
                ));
            }
        }

        #region Excel Import Operations

        /// <summary>
        /// Download Excel template for attendance import
        /// </summary>
        [HttpGet("import/template/excel/{courseOfferingId}")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAttendanceTemplateExcel(int courseOfferingId)
        {
            try
            {
                var excelBytes = await _attendanceRecordService.GetAttendanceTemplateExcelAsync(courseOfferingId);
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"attendance_template_course_{courseOfferingId}.xlsx");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Excel attendance template for course {CourseOfferingId}", courseOfferingId);
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while generating template"
                ));
            }
        }

        /// <summary>
        /// Validate attendance import file and return preview with conflicts
        /// </summary>
        /// <remarks>
        /// Accepts Excel (.xlsx) or CSV (.csv) files.
        /// Returns validation results with conflict detection for existing attendance.
        /// </remarks>
        [HttpPost("import/validate")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<BulkAttendanceValidationResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BulkAttendanceValidationResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkAttendanceValidationResponse>>> ValidateAttendanceImport(
            [FromQuery] int courseOfferingId,
            [FromQuery] DateOnly date,
            IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(ApiResponse<BulkAttendanceValidationResponse>.ErrorResponse("No file uploaded"));
                }

                var extension = Path.GetExtension(file.FileName).ToLower();
                if (extension != ".csv" && extension != ".xlsx" && extension != ".xls")
                {
                    return BadRequest(ApiResponse<BulkAttendanceValidationResponse>.ErrorResponse(
                        "Only CSV and Excel files are supported"
                    ));
                }

                using var stream = file.OpenReadStream();
                var result = await _attendanceRecordService.ValidateAttendanceImportAsync(courseOfferingId, date, stream, extension);

                return Ok(ApiResponse<BulkAttendanceValidationResponse>.SuccessResponse(
                    result,
                    $"Validation complete: {result.ValidRows} valid, {result.InvalidRows} invalid, {result.ConflictRows} conflicts"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<BulkAttendanceValidationResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating attendance import");
                return StatusCode(500, ApiResponse<BulkAttendanceValidationResponse>.ErrorResponse(
                    "An error occurred while validating import file"
                ));
            }
        }

        /// <summary>
        /// Import attendance with validation and conflict resolution
        /// </summary>
        /// <remarks>
        /// Import attendance with specified conflict resolution strategy: Skip, Update, or Error
        /// </remarks>
        [HttpPost("import/execute")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<BulkOperationResponse<AttendanceRecordResponse>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BulkOperationResponse<AttendanceRecordResponse>>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BulkOperationResponse<AttendanceRecordResponse>>>> ExecuteAttendanceImport(
            [FromBody] BulkAttendanceImportRequest request)
        {
            try
            {
                if (request.Rows == null || request.Rows.Count == 0)
                {
                    return BadRequest(ApiResponse<BulkOperationResponse<AttendanceRecordResponse>>.ErrorResponse(
                        "No attendance data provided"
                    ));
                }

                var result = await _attendanceRecordService.ImportAttendanceWithValidationAsync(request);

                var message = result.IsSuccess
                    ? $"Import completed successfully. {result.SuccessCount} records saved."
                    : $"Import completed with errors. {result.SuccessCount} succeeded, {result.ErrorCount} failed.";

                return Ok(ApiResponse<BulkOperationResponse<AttendanceRecordResponse>>.SuccessResponse(result, message));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<BulkOperationResponse<AttendanceRecordResponse>>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<BulkOperationResponse<AttendanceRecordResponse>>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing attendance import");
                return StatusCode(500, ApiResponse<BulkOperationResponse<AttendanceRecordResponse>>.ErrorResponse(
                    "An error occurred while importing attendance"
                ));
            }
        }

        #endregion
    }
}