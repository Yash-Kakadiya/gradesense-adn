using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.StudentMark.Request;
using GradeSense.API.DTOs.StudentMark.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin,Faculty")]
    public class StudentMarksController : ControllerBase
    {
        private readonly IStudentMarkService _studentMarkService;
        private readonly ILogger<StudentMarksController> _logger;

        public StudentMarksController(
            IStudentMarkService studentMarkService,
            ILogger<StudentMarksController> logger)
        {
            _studentMarkService = studentMarkService;
            _logger = logger;
        }

        /// <summary>
        /// Get all student marks with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<StudentMarkListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<StudentMarkListResponse>>>> GetAll(
            [FromQuery] StudentMarkFilterRequest filter)
        {
            try
            {
                var result = await _studentMarkService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<StudentMarkListResponse>>.SuccessResponse(
                    result,
                    "Student marks retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student marks");
                return StatusCode(500, ApiResponse<PagedResponse<StudentMarkListResponse>>.ErrorResponse(
                    "An error occurred while retrieving student marks"
                ));
            }
        }

        /// <summary>
        /// Get student mark by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<StudentMarkDetailResponse>>> GetById(int id)
        {
            try
            {
                var studentMark = await _studentMarkService.GetByIdAsync(id);
                if (studentMark == null)
                {
                    return NotFound(ApiResponse<StudentMarkDetailResponse>.ErrorResponse(
                        $"Student mark with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<StudentMarkDetailResponse>.SuccessResponse(
                    studentMark,
                    "Student mark retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving student mark {StudentMarkId}", id);
                return StatusCode(500, ApiResponse<StudentMarkDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the student mark"
                ));
            }
        }

        /// <summary>
        /// Create a new student mark
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<StudentMarkResponse>>> Create(
            [FromBody] CreateStudentMarkRequest request)
        {
            try
            {
                var studentMark = await _studentMarkService.CreateAsync(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = studentMark.Id },
                    ApiResponse<StudentMarkResponse>.SuccessResponse(
                        studentMark,
                        "Student mark created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<StudentMarkResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<StudentMarkResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating student mark");
                return StatusCode(500, ApiResponse<StudentMarkResponse>.ErrorResponse(
                    "An error occurred while creating the student mark"
                ));
            }
        }

        /// <summary>
        /// Update an existing student mark
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<StudentMarkResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<StudentMarkResponse>>> Update(
            int id,
            [FromBody] UpdateStudentMarkRequest request)
        {
            try
            {
                var studentMark = await _studentMarkService.UpdateAsync(id, request);

                return Ok(ApiResponse<StudentMarkResponse>.SuccessResponse(
                    studentMark,
                    "Student mark updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<StudentMarkResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<StudentMarkResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating student mark {StudentMarkId}", id);
                return StatusCode(500, ApiResponse<StudentMarkResponse>.ErrorResponse(
                    "An error occurred while updating the student mark"
                ));
            }
        }

        /// <summary>
        /// Delete a student mark (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _studentMarkService.DeleteAsync(id);

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Student mark deleted successfully"
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
                _logger.LogError(ex, "Error deleting student mark {StudentMarkId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the student mark"
                ));
            }
        }
    }
}