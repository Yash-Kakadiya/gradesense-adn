using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.FacultyAssignment.Request;
using GradeSense.API.DTOs.FacultyAssignment.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin,Faculty")]
    public class FacultyAssignmentsController : ControllerBase
    {
        private readonly IFacultyAssignmentService _facultyAssignmentService;
        private readonly ILogger<FacultyAssignmentsController> _logger;

        public FacultyAssignmentsController(
            IFacultyAssignmentService facultyAssignmentService,
            ILogger<FacultyAssignmentsController> logger)
        {
            _facultyAssignmentService = facultyAssignmentService;
            _logger = logger;
        }

        /// <summary>
        /// Get all faculty assignments with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<FacultyAssignmentListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<FacultyAssignmentListResponse>>>> GetAll(
            [FromQuery] FacultyAssignmentFilterRequest filter)
        {
            try
            {
                var result = await _facultyAssignmentService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<FacultyAssignmentListResponse>>.SuccessResponse(
                    result,
                    "Faculty assignments retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculty assignments");
                return StatusCode(500, ApiResponse<PagedResponse<FacultyAssignmentListResponse>>.ErrorResponse(
                    "An error occurred while retrieving faculty assignments"
                ));
            }
        }

        /// <summary>
        /// Get faculty assignment by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<FacultyAssignmentDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<FacultyAssignmentDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<FacultyAssignmentDetailResponse>>> GetById(int id)
        {
            try
            {
                var facultyAssignment = await _facultyAssignmentService.GetByIdAsync(id);
                if (facultyAssignment == null)
                {
                    return NotFound(ApiResponse<FacultyAssignmentDetailResponse>.ErrorResponse(
                        $"Faculty assignment with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<FacultyAssignmentDetailResponse>.SuccessResponse(
                    facultyAssignment,
                    "Faculty assignment retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculty assignment {FacultyAssignmentId}", id);
                return StatusCode(500, ApiResponse<FacultyAssignmentDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the faculty assignment"
                ));
            }
        }

        /// <summary>
        /// Create a new faculty assignment
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<FacultyAssignmentResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<FacultyAssignmentResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<FacultyAssignmentResponse>>> Create(
            [FromBody] CreateFacultyAssignmentRequest request)
        {
            try
            {
                var facultyAssignment = await _facultyAssignmentService.CreateAsync(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = facultyAssignment.Id },
                    ApiResponse<FacultyAssignmentResponse>.SuccessResponse(
                        facultyAssignment,
                        "Faculty assignment created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<FacultyAssignmentResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<FacultyAssignmentResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating faculty assignment");
                return StatusCode(500, ApiResponse<FacultyAssignmentResponse>.ErrorResponse(
                    "An error occurred while creating the faculty assignment"
                ));
            }
        }

        /// <summary>
        /// Update an existing faculty assignment
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<FacultyAssignmentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<FacultyAssignmentResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<FacultyAssignmentResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<FacultyAssignmentResponse>>> Update(
            int id,
            [FromBody] UpdateFacultyAssignmentRequest request)
        {
            try
            {
                var facultyAssignment = await _facultyAssignmentService.UpdateAsync(id, request);

                return Ok(ApiResponse<FacultyAssignmentResponse>.SuccessResponse(
                    facultyAssignment,
                    "Faculty assignment updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<FacultyAssignmentResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<FacultyAssignmentResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating faculty assignment {FacultyAssignmentId}", id);
                return StatusCode(500, ApiResponse<FacultyAssignmentResponse>.ErrorResponse(
                    "An error occurred while updating the faculty assignment"
                ));
            }
        }

        /// <summary>
        /// Delete a faculty assignment (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _facultyAssignmentService.DeleteAsync(id);

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Faculty assignment deleted successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting faculty assignment {FacultyAssignmentId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the faculty assignment"
                ));
            }
        }
    }
}