using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Subject.Request;
using GradeSense.API.DTOs.Subject.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // [Authorize(Roles = "Admin")]
    public class SubjectsController : ControllerBase
    {
        private readonly ISubjectService _subjectService;
        private readonly ILogger<SubjectsController> _logger;

        public SubjectsController(
            ISubjectService subjectService,
            ILogger<SubjectsController> logger)
        {
            _subjectService = subjectService;
            _logger = logger;
        }

        /// <summary>
        /// Get all subjects with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<SubjectListResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<SubjectListResponse>>>> GetAll(
            [FromQuery] SubjectFilterRequest filter)
        {
            try
            {
                var result = await _subjectService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<SubjectListResponse>>.SuccessResponse(
                    result,
                    "Subjects retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subjects");
                return StatusCode(500, ApiResponse<PagedResponse<SubjectListResponse>>.ErrorResponse(
                    "An error occurred while retrieving subjects"
                ));
            }
        }

        /// <summary>
        /// Get subject by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<SubjectDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<SubjectDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<SubjectDetailResponse>>> GetById(int id)
        {
            try
            {
                var subject = await _subjectService.GetByIdAsync(id);
                if (subject == null)
                {
                    return NotFound(ApiResponse<SubjectDetailResponse>.ErrorResponse(
                        $"Subject with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<SubjectDetailResponse>.SuccessResponse(
                    subject,
                    "Subject retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subject {SubjectId}", id);
                return StatusCode(500, ApiResponse<SubjectDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the subject"
                ));
            }
        }

        /// <summary>
        /// Create a new subject
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<SubjectResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<SubjectResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<SubjectResponse>>> Create(
            [FromBody] CreateSubjectRequest request)
        {
            try
            {
                var subject = await _subjectService.CreateAsync(request);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = subject.Id },
                    ApiResponse<SubjectResponse>.SuccessResponse(
                        subject,
                        "Subject created successfully"
                    )
                );
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<SubjectResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<SubjectResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subject");
                return StatusCode(500, ApiResponse<SubjectResponse>.ErrorResponse(
                    "An error occurred while creating the subject"
                ));
            }
        }

        /// <summary>
        /// Update an existing subject
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<SubjectResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<SubjectResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<SubjectResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<SubjectResponse>>> Update(
            int id,
            [FromBody] UpdateSubjectRequest request)
        {
            try
            {
                var subject = await _subjectService.UpdateAsync(id, request);

                return Ok(ApiResponse<SubjectResponse>.SuccessResponse(
                    subject,
                    "Subject updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<SubjectResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<SubjectResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subject {SubjectId}", id);
                return StatusCode(500, ApiResponse<SubjectResponse>.ErrorResponse(
                    "An error occurred while updating the subject"
                ));
            }
        }

        /// <summary>
        /// Delete a subject (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _subjectService.DeleteAsync(id);

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Subject deleted successfully"
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
                _logger.LogError(ex, "Error deleting subject {SubjectId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the subject"
                ));
            }
        }
    }
}