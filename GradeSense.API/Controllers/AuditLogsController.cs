using GradeSense.API.DTOs.AuditLog.Request;
using GradeSense.API.DTOs.AuditLog.Response;
using GradeSense.API.DTOs.Common;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin")]
    public class AuditLogsController : ControllerBase
    {
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<AuditLogsController> _logger;

        public AuditLogsController(
            IAuditLogService auditLogService,
            ILogger<AuditLogsController> logger)
        {
            _auditLogService = auditLogService;
            _logger = logger;
        }

        /// <summary>
        /// Get all audit logs with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<AuditLogListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<AuditLogListResponse>>>> GetAll(
            [FromQuery] AuditLogFilterRequest filter)
        {
            try
            {
                var result = await _auditLogService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<AuditLogListResponse>>.SuccessResponse(
                    result,
                    "Audit logs retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving audit logs");
                return StatusCode(500, ApiResponse<PagedResponse<AuditLogListResponse>>.ErrorResponse(
                    "An error occurred while retrieving audit logs"
                ));
            }
        }

        /// <summary>
        /// Get audit log by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<AuditLogDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<AuditLogDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<AuditLogDetailResponse>>> GetById(long id)
        {
            try
            {
                var auditLog = await _auditLogService.GetByIdAsync(id);
                if (auditLog == null)
                {
                    return NotFound(ApiResponse<AuditLogDetailResponse>.ErrorResponse(
                        $"Audit log with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<AuditLogDetailResponse>.SuccessResponse(
                    auditLog,
                    "Audit log retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving audit log {AuditLogId}", id);
                return StatusCode(500, ApiResponse<AuditLogDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the audit log"
                ));
            }
        }

        /// <summary>
        /// Create a new audit log entry (typically done programmatically)
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<AuditLogResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<AuditLogResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<AuditLogResponse>>> Create(
            [FromBody] CreateAuditLogRequest request)
        {
            try
            {
                var auditLog = await _auditLogService.CreateAsync(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = auditLog.Id },
                    ApiResponse<AuditLogResponse>.SuccessResponse(
                        auditLog,
                        "Audit log created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<AuditLogResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<AuditLogResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating audit log");
                return StatusCode(500, ApiResponse<AuditLogResponse>.ErrorResponse(
                    "An error occurred while creating the audit log"
                ));
            }
        }

        /// <summary>
        /// Update an audit log entry (typically to add a reason)
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<AuditLogResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<AuditLogResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<AuditLogResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<AuditLogResponse>>> Update(
            long id,
            [FromBody] UpdateAuditLogRequest request)
        {
            try
            {
                var auditLog = await _auditLogService.UpdateAsync(id, request);

                return Ok(ApiResponse<AuditLogResponse>.SuccessResponse(
                    auditLog,
                    "Audit log updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<AuditLogResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<AuditLogResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating audit log {AuditLogId}", id);
                return StatusCode(500, ApiResponse<AuditLogResponse>.ErrorResponse(
                    "An error occurred while updating the audit log"
                ));
            }
        }

        /// <summary>
        /// Delete an audit log (soft delete - rare operation for compliance)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(long id)
        {
            try
            {
                var result = await _auditLogService.DeleteAsync(id);

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Audit log deleted successfully"
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
                _logger.LogError(ex, "Error deleting audit log {AuditLogId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the audit log"
                ));
            }
        }
    }
}