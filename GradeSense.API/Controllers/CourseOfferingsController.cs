using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.CourseOffering.Request;
using GradeSense.API.DTOs.CourseOffering.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Faculty")]
    public class CourseOfferingsController : ControllerBase
    {
        private readonly ICourseOfferingService _courseOfferingService;
        private readonly ILogger<CourseOfferingsController> _logger;
        private readonly IAuditLogger _auditLogger;

        public CourseOfferingsController(
            ICourseOfferingService courseOfferingService,
            ILogger<CourseOfferingsController> logger,
            IAuditLogger auditLogger)
        {
            _courseOfferingService = courseOfferingService;
            _logger = logger;
            _auditLogger = auditLogger;
        }

        /// <summary>
        /// Get all course offerings with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<CourseOfferingListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<CourseOfferingListResponse>>>> GetAll(
            [FromQuery] CourseOfferingFilterRequest filter)
        {
            try
            {
                var result = await _courseOfferingService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<CourseOfferingListResponse>>.SuccessResponse(
                    result,
                    "Course offerings retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course offerings");
                return StatusCode(500, ApiResponse<PagedResponse<CourseOfferingListResponse>>.ErrorResponse(
                    "An error occurred while retrieving course offerings"
                ));
            }
        }

        /// <summary>
        /// Get course offering by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<CourseOfferingDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<CourseOfferingDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<CourseOfferingDetailResponse>>> GetById(int id)
        {
            try
            {
                var courseOffering = await _courseOfferingService.GetByIdAsync(id);
                if (courseOffering == null)
                {
                    return NotFound(ApiResponse<CourseOfferingDetailResponse>.ErrorResponse(
                        $"Course offering with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<CourseOfferingDetailResponse>.SuccessResponse(
                    courseOffering,
                    "Course offering retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving course offering {CourseOfferingId}", id);
                return StatusCode(500, ApiResponse<CourseOfferingDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the course offering"
                ));
            }
        }

        /// <summary>
        /// Create a new course offering
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<CourseOfferingResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<CourseOfferingResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<CourseOfferingResponse>>> Create(
            [FromBody] CreateCourseOfferingRequest request)
        {
            try
            {
                var courseOffering = await _courseOfferingService.CreateAsync(request);

                // Create audit log
                await _auditLogger.LogAsync("Create", "CourseOffering", courseOffering.Id.ToString(), $"Created course offering for subject: {courseOffering.SubjectCode}");

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = courseOffering.Id },
                    ApiResponse<CourseOfferingResponse>.SuccessResponse(
                        courseOffering,
                        "Course offering created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<CourseOfferingResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<CourseOfferingResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating course offering");
                return StatusCode(500, ApiResponse<CourseOfferingResponse>.ErrorResponse(
                    "An error occurred while creating the course offering"
                ));
            }
        }

        /// <summary>
        /// Update an existing course offering
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<CourseOfferingResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<CourseOfferingResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<CourseOfferingResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<CourseOfferingResponse>>> Update(
            int id,
            [FromBody] UpdateCourseOfferingRequest request)
        {
            try
            {
                // Get old data for audit trail
                var oldCourseOffering = await _courseOfferingService.GetByIdAsync(id);
                if (oldCourseOffering == null)
                {
                    return NotFound(ApiResponse<CourseOfferingResponse>.ErrorResponse($"Course offering with ID {id} not found"));
                }

                var courseOffering = await _courseOfferingService.UpdateAsync(id, request);

                // Create audit log with change tracking
                await _auditLogger.LogUpdateAsync("CourseOffering", id.ToString(), oldCourseOffering, courseOffering, $"Updated course offering");

                return Ok(ApiResponse<CourseOfferingResponse>.SuccessResponse(
                    courseOffering,
                    "Course offering updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<CourseOfferingResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<CourseOfferingResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating course offering {CourseOfferingId}", id);
                return StatusCode(500, ApiResponse<CourseOfferingResponse>.ErrorResponse(
                    "An error occurred while updating the course offering"
                ));
            }
        }

        /// <summary>
        /// Delete a course offering (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _courseOfferingService.DeleteAsync(id);

                // Create audit log
                await _auditLogger.LogAsync("Delete", "CourseOffering", id.ToString(), "Deleted course offering");

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Course offering deleted successfully"
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
                _logger.LogError(ex, "Error deleting course offering {CourseOfferingId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the course offering"
                ));
            }
        }
    }
}