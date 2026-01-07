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
    // [Authorize(Roles = "Admin,Faculty")]
    public class AttendanceRecordsController : ControllerBase
    {
        private readonly IAttendanceRecordService _attendanceRecordService;
        private readonly ILogger<AttendanceRecordsController> _logger;

        public AttendanceRecordsController(
            IAttendanceRecordService attendanceRecordService,
            ILogger<AttendanceRecordsController> logger)
        {
            _attendanceRecordService = attendanceRecordService;
            _logger = logger;
        }

        /// <summary>
        /// Get all attendance records with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<AttendanceRecordListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<AttendanceRecordListResponse>>>> GetAll(
            [FromQuery] AttendanceRecordFilterRequest filter)
        {
            try
            {
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
        [ProducesResponseType(typeof(ApiResponse<AttendanceRecordResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<AttendanceRecordResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<AttendanceRecordResponse>>> Create(
            [FromBody] CreateAttendanceRecordRequest request)
        {
            try
            {
                var attendanceRecord = await _attendanceRecordService.CreateAsync(request);

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
        [ProducesResponseType(typeof(ApiResponse<AttendanceRecordResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<AttendanceRecordResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<AttendanceRecordResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<AttendanceRecordResponse>>> Update(
            int id,
            [FromBody] UpdateAttendanceRecordRequest request)
        {
            try
            {
                var attendanceRecord = await _attendanceRecordService.UpdateAsync(id, request);

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
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _attendanceRecordService.DeleteAsync(id);

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
    }
}