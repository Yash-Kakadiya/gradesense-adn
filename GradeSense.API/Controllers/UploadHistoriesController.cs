using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.UploadHistory.Request;
using GradeSense.API.DTOs.UploadHistory.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Faculty")]
    public class UploadHistoriesController : ControllerBase
    {
        private readonly IUploadHistoryService _uploadHistoryService;
        private readonly ILogger<UploadHistoriesController> _logger;

        public UploadHistoriesController(
            IUploadHistoryService uploadHistoryService,
            ILogger<UploadHistoriesController> logger)
        {
            _uploadHistoryService = uploadHistoryService;
            _logger = logger;
        }

        /// <summary>
        /// Get all upload histories with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<UploadHistoryListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<UploadHistoryListResponse>>>> GetAll(
            [FromQuery] UploadHistoryFilterRequest filter)
        {
            try
            {
                var result = await _uploadHistoryService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<UploadHistoryListResponse>>.SuccessResponse(
                    result,
                    "Upload histories retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving upload histories");
                return StatusCode(500, ApiResponse<PagedResponse<UploadHistoryListResponse>>.ErrorResponse(
                    "An error occurred while retrieving upload histories"
                ));
            }
        }

        /// <summary>
        /// Get upload history by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<UploadHistoryDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<UploadHistoryDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<UploadHistoryDetailResponse>>> GetById(string id)
        {
            try
            {
                var uploadHistory = await _uploadHistoryService.GetByIdAsync(id);
                if (uploadHistory == null)
                {
                    return NotFound(ApiResponse<UploadHistoryDetailResponse>.ErrorResponse(
                        $"Upload history with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<UploadHistoryDetailResponse>.SuccessResponse(
                    uploadHistory,
                    "Upload history retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving upload history {UploadHistoryId}", id);
                return StatusCode(500, ApiResponse<UploadHistoryDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the upload history"
                ));
            }
        }

        /// <summary>
        /// Create a new upload history record
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<UploadHistoryResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<UploadHistoryResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<UploadHistoryResponse>>> Create(
            [FromBody] CreateUploadHistoryRequest request)
        {
            try
            {
                var uploadHistory = await _uploadHistoryService.CreateAsync(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = uploadHistory.Id },
                    ApiResponse<UploadHistoryResponse>.SuccessResponse(
                        uploadHistory,
                        "Upload history created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<UploadHistoryResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating upload history");
                return StatusCode(500, ApiResponse<UploadHistoryResponse>.ErrorResponse(
                    "An error occurred while creating the upload history"
                ));
            }
        }

        /// <summary>
        /// Update an existing upload history record
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<UploadHistoryResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<UploadHistoryResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<UploadHistoryResponse>>> Update(
            string id,
            [FromBody] UpdateUploadHistoryRequest request)
        {
            try
            {
                var uploadHistory = await _uploadHistoryService.UpdateAsync(id, request);

                return Ok(ApiResponse<UploadHistoryResponse>.SuccessResponse(
                    uploadHistory,
                    "Upload history updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<UploadHistoryResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating upload history {UploadHistoryId}", id);
                return StatusCode(500, ApiResponse<UploadHistoryResponse>.ErrorResponse(
                    "An error occurred while updating the upload history"
                ));
            }
        }

        /// <summary>
        /// Delete an upload history record (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
        {
            try
            {
                var result = await _uploadHistoryService.DeleteAsync(id);

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Upload history deleted successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting upload history {UploadHistoryId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the upload history"
                ));
            }
        }
    }
}