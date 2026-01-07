using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.SubjectUnit.Request;
using GradeSense.API.DTOs.SubjectUnit.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin,Faculty")]
    public class SubjectUnitsController : ControllerBase
    {
        private readonly ISubjectUnitService _subjectUnitService;
        private readonly ILogger<SubjectUnitsController> _logger;

        public SubjectUnitsController(
            ISubjectUnitService subjectUnitService,
            ILogger<SubjectUnitsController> logger)
        {
            _subjectUnitService = subjectUnitService;
            _logger = logger;
        }

        /// <summary>
        /// Get all subject units with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<SubjectUnitListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<SubjectUnitListResponse>>>> GetAll(
            [FromQuery] SubjectUnitFilterRequest filter)
        {
            try
            {
                var result = await _subjectUnitService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<SubjectUnitListResponse>>.SuccessResponse(
                    result,
                    "Subject units retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subject units");
                return StatusCode(500, ApiResponse<PagedResponse<SubjectUnitListResponse>>.ErrorResponse(
                    "An error occurred while retrieving subject units"
                ));
            }
        }

        /// <summary>
        /// Get subject unit by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<SubjectUnitDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<SubjectUnitDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<SubjectUnitDetailResponse>>> GetById(int id)
        {
            try
            {
                var subjectUnit = await _subjectUnitService.GetByIdAsync(id);
                if (subjectUnit == null)
                {
                    return NotFound(ApiResponse<SubjectUnitDetailResponse>.ErrorResponse(
                        $"Subject unit with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<SubjectUnitDetailResponse>.SuccessResponse(
                    subjectUnit,
                    "Subject unit retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subject unit {SubjectUnitId}", id);
                return StatusCode(500, ApiResponse<SubjectUnitDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the subject unit"
                ));
            }
        }

        /// <summary>
        /// Create a new subject unit
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<SubjectUnitResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<SubjectUnitResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<SubjectUnitResponse>>> Create(
            [FromBody] CreateSubjectUnitRequest request)
        {
            try
            {
                var subjectUnit = await _subjectUnitService.CreateAsync(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = subjectUnit.Id },
                    ApiResponse<SubjectUnitResponse>.SuccessResponse(
                        subjectUnit,
                        "Subject unit created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<SubjectUnitResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<SubjectUnitResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subject unit");
                return StatusCode(500, ApiResponse<SubjectUnitResponse>.ErrorResponse(
                    "An error occurred while creating the subject unit"
                ));
            }
        }

        /// <summary>
        /// Update an existing subject unit
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<SubjectUnitResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<SubjectUnitResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<SubjectUnitResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<SubjectUnitResponse>>> Update(
            int id,
            [FromBody] UpdateSubjectUnitRequest request)
        {
            try
            {
                var subjectUnit = await _subjectUnitService.UpdateAsync(id, request);

                return Ok(ApiResponse<SubjectUnitResponse>.SuccessResponse(
                    subjectUnit,
                    "Subject unit updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<SubjectUnitResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<SubjectUnitResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subject unit {SubjectUnitId}", id);
                return StatusCode(500, ApiResponse<SubjectUnitResponse>.ErrorResponse(
                    "An error occurred while updating the subject unit"
                ));
            }
        }

        /// <summary>
        /// Delete a subject unit (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _subjectUnitService.DeleteAsync(id);

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Subject unit deleted successfully"
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
                _logger.LogError(ex, "Error deleting subject unit {SubjectUnitId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the subject unit"
                ));
            }
        }
    }
}