using GradeSense.API.DTOs.AssessmentItem.Request;
using GradeSense.API.DTOs.AssessmentItem.Response;
using GradeSense.API.DTOs.Common;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssessmentItemsController : ControllerBase
    {
        private readonly IAssessmentItemService _assessmentItemService;
        private readonly ILogger<AssessmentItemsController> _logger;
        private readonly IAuditLogger _auditLogger;

        public AssessmentItemsController(
            IAssessmentItemService assessmentItemService,
            ILogger<AssessmentItemsController> logger,
            IAuditLogger auditLogger)
        {
            _assessmentItemService = assessmentItemService;
            _logger = logger;
            _auditLogger = auditLogger;
        }

        /// <summary>
        /// Get all assessment items with filtering and pagination
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Faculty,Student")]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<AssessmentItemListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<AssessmentItemListResponse>>>> GetAll(
            [FromQuery] AssessmentItemFilterRequest filter)
        {
            try
            {
                var result = await _assessmentItemService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<AssessmentItemListResponse>>.SuccessResponse(
                    result,
                    "Assessment items retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving assessment items");
                return StatusCode(500, ApiResponse<PagedResponse<AssessmentItemListResponse>>.ErrorResponse(
                    "An error occurred while retrieving assessment items"
                ));
            }
        }

        /// <summary>
        /// Get assessment item by ID
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Faculty,Student")]
        [ProducesResponseType(typeof(ApiResponse<AssessmentItemDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<AssessmentItemDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<AssessmentItemDetailResponse>>> GetById(int id)
        {
            try
            {
                var assessmentItem = await _assessmentItemService.GetByIdAsync(id);
                if (assessmentItem == null)
                {
                    return NotFound(ApiResponse<AssessmentItemDetailResponse>.ErrorResponse(
                        $"Assessment item with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<AssessmentItemDetailResponse>.SuccessResponse(
                    assessmentItem,
                    "Assessment item retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving assessment item {AssessmentItemId}", id);
                return StatusCode(500, ApiResponse<AssessmentItemDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the assessment item"
                ));
            }
        }

        /// <summary>
        /// Create a new assessment item
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<AssessmentItemResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<AssessmentItemResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<AssessmentItemResponse>>> Create(
            [FromBody] CreateAssessmentItemRequest request)
        {
            try
            {
                var assessmentItem = await _assessmentItemService.CreateAsync(request);

                await _auditLogger.LogAsync("Create", "AssessmentItem", assessmentItem.Id.ToString(), 
                    $"Created assessment item: {request.Name}");

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = assessmentItem.Id },
                    ApiResponse<AssessmentItemResponse>.SuccessResponse(
                        assessmentItem,
                        "Assessment item created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<AssessmentItemResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<AssessmentItemResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating assessment item");
                return StatusCode(500, ApiResponse<AssessmentItemResponse>.ErrorResponse(
                    "An error occurred while creating the assessment item"
                ));
            }
        }

        /// <summary>
        /// Update an existing assessment item
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Faculty")]
        [ProducesResponseType(typeof(ApiResponse<AssessmentItemResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<AssessmentItemResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<AssessmentItemResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<AssessmentItemResponse>>> Update(
            int id,
            [FromBody] UpdateAssessmentItemRequest request)
        {
            try
            {
                var oldItem = await _assessmentItemService.GetByIdAsync(id);
                var assessmentItem = await _assessmentItemService.UpdateAsync(id, request);

                if (oldItem != null)
                    await _auditLogger.LogUpdateAsync("AssessmentItem", id.ToString(), oldItem, assessmentItem, "Updated assessment item");

                return Ok(ApiResponse<AssessmentItemResponse>.SuccessResponse(
                    assessmentItem,
                    "Assessment item updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<AssessmentItemResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<AssessmentItemResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating assessment item {AssessmentItemId}", id);
                return StatusCode(500, ApiResponse<AssessmentItemResponse>.ErrorResponse(
                    "An error occurred while updating the assessment item"
                ));
            }
        }

        /// <summary>
        /// Delete an assessment item (soft delete)
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
                var result = await _assessmentItemService.DeleteAsync(id);

                await _auditLogger.LogAsync("Delete", "AssessmentItem", id.ToString(), "Deleted assessment item (with cascade delete of student marks)");

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Assessment item deleted successfully"
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
                _logger.LogError(ex, "Error deleting assessment item {AssessmentItemId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the assessment item"
                ));
            }
        }
    }
}