using GradeSense.API.DTOs.Batch.Request;
using GradeSense.API.DTOs.Batch.Response;
using GradeSense.API.DTOs.Common;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Faculty")]
    public class BatchesController : ControllerBase
    {
        private readonly IBatchService _batchService;
        private readonly ILogger<BatchesController> _logger;
        private readonly IAuditLogger _auditLogger;

        public BatchesController(
            IBatchService batchService,
            ILogger<BatchesController> logger,
            IAuditLogger auditLogger)
        {
            _batchService = batchService;
            _logger = logger;
            _auditLogger = auditLogger;
        }

        /// <summary>
        /// Get all batches with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<BatchListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<BatchListResponse>>>> GetAll(
            [FromQuery] BatchFilterRequest filter)
        {
            try
            {
                var result = await _batchService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<BatchListResponse>>.SuccessResponse(
                    result,
                    "Batches retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving batches");
                return StatusCode(500, ApiResponse<PagedResponse<BatchListResponse>>.ErrorResponse(
                    "An error occurred while retrieving batches"
                ));
            }
        }

        /// <summary>
        /// Get batch by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<BatchDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BatchDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<BatchDetailResponse>>> GetById(int id)
        {
            try
            {
                var batch = await _batchService.GetByIdAsync(id);
                if (batch == null)
                {
                    return NotFound(ApiResponse<BatchDetailResponse>.ErrorResponse(
                        $"Batch with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<BatchDetailResponse>.SuccessResponse(
                    batch,
                    "Batch retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving batch {BatchId}", id);
                return StatusCode(500, ApiResponse<BatchDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the batch"
                ));
            }
        }

        /// <summary>
        /// Create a new batch
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<BatchResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<BatchResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BatchResponse>>> Create(
            [FromBody] CreateBatchRequest request)
        {
            try
            {
                var batch = await _batchService.CreateAsync(request);

                // Create audit log
                await _auditLogger.LogAsync("Create", "Batch", batch.Id.ToString(), $"Created batch: {batch.Name}");

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = batch.Id },
                    ApiResponse<BatchResponse>.SuccessResponse(
                        batch,
                        "Batch created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<BatchResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<BatchResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating batch");
                return StatusCode(500, ApiResponse<BatchResponse>.ErrorResponse(
                    "An error occurred while creating the batch"
                ));
            }
        }

        /// <summary>
        /// Update an existing batch
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<BatchResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<BatchResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<BatchResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<BatchResponse>>> Update(
            int id,
            [FromBody] UpdateBatchRequest request)
        {
            try
            {
                // Get old data for audit trail
                var oldBatch = await _batchService.GetByIdAsync(id);
                if (oldBatch == null)
                {
                    return NotFound(ApiResponse<BatchResponse>.ErrorResponse($"Batch with ID {id} not found"));
                }

                var batch = await _batchService.UpdateAsync(id, request);

                // Create audit log with change tracking
                await _auditLogger.LogUpdateAsync("Batch", id.ToString(), oldBatch, batch, $"Updated batch: {batch.Name}");

                return Ok(ApiResponse<BatchResponse>.SuccessResponse(
                    batch,
                    "Batch updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<BatchResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<BatchResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating batch {BatchId}", id);
                return StatusCode(500, ApiResponse<BatchResponse>.ErrorResponse(
                    "An error occurred while updating the batch"
                ));
            }
        }

        /// <summary>
        /// Delete a batch (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _batchService.DeleteAsync(id);

                // Create audit log
                await _auditLogger.LogAsync("Delete", "Batch", id.ToString(), "Deleted batch");

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Batch deleted successfully"
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
                _logger.LogError(ex, "Error deleting batch {BatchId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the batch"
                ));
            }
        }
    }
}