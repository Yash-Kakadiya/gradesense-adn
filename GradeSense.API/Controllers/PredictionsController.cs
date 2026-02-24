using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Prediction.Request;
using GradeSense.API.DTOs.Prediction.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Faculty")]
    public class PredictionsController : ControllerBase
    {
        private readonly IPredictionService _predictionService;
        private readonly ILogger<PredictionsController> _logger;
        private readonly IAuditLogger _auditLogger;

        public PredictionsController(
            IPredictionService predictionService,
            ILogger<PredictionsController> logger,
            IAuditLogger auditLogger)
        {
            _predictionService = predictionService;
            _logger = logger;
            _auditLogger = auditLogger;
        }

        /// <summary>
        /// Get all predictions with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<PredictionListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<PredictionListResponse>>>> GetAll(
            [FromQuery] PredictionFilterRequest filter)
        {
            try
            {
                var result = await _predictionService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<PredictionListResponse>>.SuccessResponse(
                    result,
                    "Predictions retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving predictions");
                return StatusCode(500, ApiResponse<PagedResponse<PredictionListResponse>>.ErrorResponse(
                    "An error occurred while retrieving predictions"
                ));
            }
        }

        /// <summary>
        /// Get prediction by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<PredictionDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<PredictionDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<PredictionDetailResponse>>> GetById(string id)
        {
            try
            {
                var prediction = await _predictionService.GetByIdAsync(id);
                if (prediction == null)
                {
                    return NotFound(ApiResponse<PredictionDetailResponse>.ErrorResponse(
                        $"Prediction with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<PredictionDetailResponse>.SuccessResponse(
                    prediction,
                    "Prediction retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving prediction {PredictionId}", id);
                return StatusCode(500, ApiResponse<PredictionDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the prediction"
                ));
            }
        }

        /// <summary>
        /// Create a new prediction
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<PredictionResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<PredictionResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<PredictionResponse>>> Create(
            [FromBody] CreatePredictionRequest request)
        {
            try
            {
                var prediction = await _predictionService.CreateAsync(request);

                await _auditLogger.LogAsync("Create", "Prediction", prediction.Id, 
                    $"Created prediction for enrollment {request.CourseEnrollmentId}: Category {request.PredictedCategory}");

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = prediction.Id },
                    ApiResponse<PredictionResponse>.SuccessResponse(
                        prediction,
                        "Prediction created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<PredictionResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<PredictionResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating prediction");
                return StatusCode(500, ApiResponse<PredictionResponse>.ErrorResponse(
                    "An error occurred while creating the prediction"
                ));
            }
        }

        /// <summary>
        /// Update an existing prediction
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<PredictionResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<PredictionResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<PredictionResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<PredictionResponse>>> Update(
            string id,
            [FromBody] UpdatePredictionRequest request)
        {
            try
            {
                var oldPrediction = await _predictionService.GetByIdAsync(id);
                var prediction = await _predictionService.UpdateAsync(id, request);

                if (oldPrediction != null)
                    await _auditLogger.LogUpdateAsync("Prediction", id, oldPrediction, prediction, "Updated prediction/risk assessment");

                return Ok(ApiResponse<PredictionResponse>.SuccessResponse(
                    prediction,
                    "Prediction updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<PredictionResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<PredictionResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating prediction {PredictionId}", id);
                return StatusCode(500, ApiResponse<PredictionResponse>.ErrorResponse(
                    "An error occurred while updating the prediction"
                ));
            }
        }

        /// <summary>
        /// Delete a prediction (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(string id)
        {
            try
            {
                var result = await _predictionService.DeleteAsync(id);

                await _auditLogger.LogAsync("Delete", "Prediction", id, "Deleted prediction");

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Prediction deleted successfully"
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
                _logger.LogError(ex, "Error deleting prediction {PredictionId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the prediction"
                ));
            }
        }
    }
}