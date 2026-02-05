using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.CourseEnrollment.Request;
using GradeSense.API.DTOs.CourseEnrollment.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Faculty")]
    public class CourseEnrollmentsController : ControllerBase
    {
        private readonly ICourseEnrollmentService _courseEnrollmentService;
        private readonly ILogger<CourseEnrollmentsController> _logger;

        public CourseEnrollmentsController(
            ICourseEnrollmentService courseEnrollmentService,
            ILogger<CourseEnrollmentsController> logger)
        {
            _courseEnrollmentService = courseEnrollmentService;
            _logger = logger;
        }

        /// <summary>
        /// Get all course enrollments with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<CourseEnrollmentListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<CourseEnrollmentListResponse>>>> GetAll(
            [FromQuery] CourseEnrollmentFilterRequest filter)
        {
            try
            {
                var result = await _courseEnrollmentService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<CourseEnrollmentListResponse>>.SuccessResponse(
                    result,
                    "Course enrollments retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course enrollments");
                return StatusCode(500, ApiResponse<PagedResponse<CourseEnrollmentListResponse>>.ErrorResponse(
                    "An error occurred while retrieving course enrollments"
                ));
            }
        }

        /// <summary>
        /// Get course enrollment by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<CourseEnrollmentDetailResponse>>> GetById(int id)
        {
            try
            {
                var courseEnrollment = await _courseEnrollmentService.GetByIdAsync(id);
                if (courseEnrollment == null)
                {
                    return NotFound(ApiResponse<CourseEnrollmentDetailResponse>.ErrorResponse(
                        $"Course enrollment with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<CourseEnrollmentDetailResponse>.SuccessResponse(
                    courseEnrollment,
                    "Course enrollment retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course enrollment {CourseEnrollmentId}", id);
                return StatusCode(500, ApiResponse<CourseEnrollmentDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the course enrollment"
                ));
            }
        }

        /// <summary>
        /// Create a new course enrollment
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<CourseEnrollmentResponse>>> Create(
            [FromBody] CreateCourseEnrollmentRequest request)
        {
            try
            {
                var courseEnrollment = await _courseEnrollmentService.CreateAsync(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = courseEnrollment.Id },
                    ApiResponse<CourseEnrollmentResponse>.SuccessResponse(
                        courseEnrollment,
                        "Course enrollment created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<CourseEnrollmentResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<CourseEnrollmentResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating course enrollment");
                return StatusCode(500, ApiResponse<CourseEnrollmentResponse>.ErrorResponse(
                    "An error occurred while creating the course enrollment"
                ));
            }
        }

        /// <summary>
        /// Update an existing course enrollment
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<CourseEnrollmentResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<CourseEnrollmentResponse>>> Update(
            int id,
            [FromBody] UpdateCourseEnrollmentRequest request)
        {
            try
            {
                var courseEnrollment = await _courseEnrollmentService.UpdateAsync(id, request);

                return Ok(ApiResponse<CourseEnrollmentResponse>.SuccessResponse(
                    courseEnrollment,
                    "Course enrollment updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<CourseEnrollmentResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<CourseEnrollmentResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating course enrollment {CourseEnrollmentId}", id);
                return StatusCode(500, ApiResponse<CourseEnrollmentResponse>.ErrorResponse(
                    "An error occurred while updating the course enrollment"
                ));
            }
        }

        /// <summary>
        /// Delete a course enrollment (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _courseEnrollmentService.DeleteAsync(id);

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Course enrollment deleted successfully"
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
                _logger.LogError(ex, "Error deleting course enrollment {CourseEnrollmentId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the course enrollment"
                ));
            }
        }
    }
}