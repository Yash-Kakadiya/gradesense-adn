using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.EvaluationScheme.Request;
using GradeSense.API.DTOs.EvaluationScheme.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Faculty")]
    public class EvaluationSchemesController : ControllerBase
    {
        private readonly IEvaluationSchemeService _evaluationSchemeService;
        private readonly ILogger<EvaluationSchemesController> _logger;

        public EvaluationSchemesController(
            IEvaluationSchemeService evaluationSchemeService,
            ILogger<EvaluationSchemesController> logger)
        {
            _evaluationSchemeService = evaluationSchemeService;
            _logger = logger;
        }

        /// <summary>
        /// Get all evaluation schemes with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<EvaluationSchemeListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<EvaluationSchemeListResponse>>>> GetAll(
            [FromQuery] EvaluationSchemeFilterRequest filter)
        {
            try
            {
                var result = await _evaluationSchemeService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<EvaluationSchemeListResponse>>.SuccessResponse(
                    result,
                    "Evaluation schemes retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving evaluation schemes");
                return StatusCode(500, ApiResponse<PagedResponse<EvaluationSchemeListResponse>>.ErrorResponse(
                    "An error occurred while retrieving evaluation schemes"
                ));
            }
        }

        /// <summary>
        /// Get evaluation scheme by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<EvaluationSchemeDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<EvaluationSchemeDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<EvaluationSchemeDetailResponse>>> GetById(int id)
        {
            try
            {
                var evaluationScheme = await _evaluationSchemeService.GetByIdAsync(id);
                if (evaluationScheme == null)
                {
                    return NotFound(ApiResponse<EvaluationSchemeDetailResponse>.ErrorResponse(
                        $"Evaluation scheme with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<EvaluationSchemeDetailResponse>.SuccessResponse(
                    evaluationScheme,
                    "Evaluation scheme retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving evaluation scheme {EvaluationSchemeId}", id);
                return StatusCode(500, ApiResponse<EvaluationSchemeDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the evaluation scheme"
                ));
            }
        }

        /// <summary>
        /// Create a new evaluation scheme
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<EvaluationSchemeResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<EvaluationSchemeResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<EvaluationSchemeResponse>>> Create(
            [FromBody] CreateEvaluationSchemeRequest request)
        {
            try
            {
                var evaluationScheme = await _evaluationSchemeService.CreateAsync(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = evaluationScheme.Id },
                    ApiResponse<EvaluationSchemeResponse>.SuccessResponse(
                        evaluationScheme,
                        "Evaluation scheme created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<EvaluationSchemeResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<EvaluationSchemeResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating evaluation scheme");
                return StatusCode(500, ApiResponse<EvaluationSchemeResponse>.ErrorResponse(
                    "An error occurred while creating the evaluation scheme"
                ));
            }
        }

        /// <summary>
        /// Update an existing evaluation scheme
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<EvaluationSchemeResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<EvaluationSchemeResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<EvaluationSchemeResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<EvaluationSchemeResponse>>> Update(
            int id,
            [FromBody] UpdateEvaluationSchemeRequest request)
        {
            try
            {
                var evaluationScheme = await _evaluationSchemeService.UpdateAsync(id, request);

                return Ok(ApiResponse<EvaluationSchemeResponse>.SuccessResponse(
                    evaluationScheme,
                    "Evaluation scheme updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<EvaluationSchemeResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<EvaluationSchemeResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating evaluation scheme {EvaluationSchemeId}", id);
                return StatusCode(500, ApiResponse<EvaluationSchemeResponse>.ErrorResponse(
                    "An error occurred while updating the evaluation scheme"
                ));
            }
        }

        /// <summary>
        /// Delete an evaluation scheme (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _evaluationSchemeService.DeleteAsync(id);

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Evaluation scheme deleted successfully"
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
                _logger.LogError(ex, "Error deleting evaluation scheme {EvaluationSchemeId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the evaluation scheme"
                ));
            }
        }
    }
}