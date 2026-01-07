using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Faculty.Request;
using GradeSense.API.DTOs.Faculty.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin")]
    public class FacultiesController : ControllerBase
    {
        private readonly IFacultyService _facultyService;
        private readonly ILogger<FacultiesController> _logger;

        public FacultiesController(
            IFacultyService facultyService,
            ILogger<FacultiesController> logger)
        {
            _facultyService = facultyService;
            _logger = logger;
        }

        /// <summary>
        /// Get all faculties with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<FacultyListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<FacultyListResponse>>>> GetAll(
            [FromQuery] FacultyFilterRequest filter)
        {
            try
            {
                var result = await _facultyService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<FacultyListResponse>>.SuccessResponse(
                    result,
                    "Faculties retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculties");
                return StatusCode(500, ApiResponse<PagedResponse<FacultyListResponse>>.ErrorResponse(
                    "An error occurred while retrieving faculties"
                ));
            }
        }

        /// <summary>
        /// Get faculty by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<FacultyDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<FacultyDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<FacultyDetailResponse>>> GetById(int id)
        {
            try
            {
                var faculty = await _facultyService.GetByIdAsync(id);
                if (faculty == null)
                {
                    return NotFound(ApiResponse<FacultyDetailResponse>.ErrorResponse(
                        $"Faculty with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<FacultyDetailResponse>.SuccessResponse(
                    faculty,
                    "Faculty retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving faculty {FacultyId}", id);
                return StatusCode(500, ApiResponse<FacultyDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the faculty"
                ));
            }
        }

        /// <summary>
        /// Create a new faculty
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<FacultyResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<FacultyResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<FacultyResponse>>> Create(
            [FromBody] CreateFacultyRequest request)
        {
            try
            {
                var faculty = await _facultyService.CreateAsync(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = faculty.Id },
                    ApiResponse<FacultyResponse>.SuccessResponse(
                        faculty,
                        "Faculty created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<FacultyResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<FacultyResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating faculty");
                return StatusCode(500, ApiResponse<FacultyResponse>.ErrorResponse(
                    "An error occurred while creating the faculty"
                ));
            }
        }

        /// <summary>
        /// Update an existing faculty
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<FacultyResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<FacultyResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<FacultyResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<FacultyResponse>>> Update(
            int id,
            [FromBody] UpdateFacultyRequest request)
        {
            try
            {
                var faculty = await _facultyService.UpdateAsync(id, request);

                return Ok(ApiResponse<FacultyResponse>.SuccessResponse(
                    faculty,
                    "Faculty updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<FacultyResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<FacultyResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating faculty {FacultyId}", id);
                return StatusCode(500, ApiResponse<FacultyResponse>.ErrorResponse(
                    "An error occurred while updating the faculty"
                ));
            }
        }

        /// <summary>
        /// Delete a faculty (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _facultyService.DeleteAsync(id);

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Faculty deleted successfully"
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
                _logger.LogError(ex, "Error deleting faculty {FacultyId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the faculty"
                ));
            }
        }
    }
}