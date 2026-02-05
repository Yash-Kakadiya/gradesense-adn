using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Department.Request;
using GradeSense.API.DTOs.Department.Response;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GradeSense.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;
        private readonly ILogger<DepartmentsController> _logger;
        private readonly IAuditLogger _auditLogger;

        public DepartmentsController(
            IDepartmentService departmentService,
            ILogger<DepartmentsController> logger,
            IAuditLogger auditLogger)
        {
            _departmentService = departmentService;
            _logger = logger;
            _auditLogger = auditLogger;
        }

        /// <summary>
        /// Get all departments with filtering and pagination
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResponse<DepartmentResponse>>), StatusCodes.Status200OK)]
        public async Task<ActionResult<ApiResponse<PagedResponse<DepartmentResponse>>>> GetAll(
            [FromQuery] DepartmentFilterRequest filter)
        {
            try
            {
                var result = await _departmentService.GetAllAsync(filter);
                return Ok(ApiResponse<PagedResponse<DepartmentResponse>>.SuccessResponse(
                    result,
                    "Departments retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving departments");
                return StatusCode(500, ApiResponse<PagedResponse<DepartmentResponse>>.ErrorResponse(
                    "An error occurred while retrieving departments"
                ));
            }
        }

        /// <summary>
        /// Get department by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<DepartmentDetailResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<DepartmentDetailResponse>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<DepartmentDetailResponse>>> GetById(int id)
        {
            try
            {
                var department = await _departmentService.GetByIdAsync(id);
                if (department == null)
                {
                    return NotFound(ApiResponse<DepartmentDetailResponse>.ErrorResponse(
                        $"Department with ID {id} not found"
                    ));
                }

                return Ok(ApiResponse<DepartmentDetailResponse>.SuccessResponse(
                    department,
                    "Department retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving department {DepartmentId}", id);
                return StatusCode(500, ApiResponse<DepartmentDetailResponse>.ErrorResponse(
                    "An error occurred while retrieving the department"
                ));
            }
        }

        /// <summary>
        /// Create a new department
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<DepartmentResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<DepartmentResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<DepartmentResponse>>> Create(
            [FromBody] CreateDepartmentRequest request)
        {
            try
            {
                var department = await _departmentService.CreateAsync(request);

                // Create audit log
                await _auditLogger.LogAsync("Create", "Department", department.Id.ToString(), $"Created department: {department.Name} ({department.Code})");

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = department.Id },
                    ApiResponse<DepartmentResponse>.SuccessResponse(
                        department,
                        "Department created successfully"
                    )
                );
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<DepartmentResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating department");
                return StatusCode(500, ApiResponse<DepartmentResponse>.ErrorResponse(
                    "An error occurred while creating the department"
                ));
            }
        }

        /// <summary>
        /// Update an existing department
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<DepartmentResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<DepartmentResponse>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<DepartmentResponse>), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<DepartmentResponse>>> Update(
            int id,
            [FromBody] UpdateDepartmentRequest request)
        {
            try
            {
                // Get old data for audit trail
                var oldDepartment = await _departmentService.GetByIdAsync(id);
                if (oldDepartment == null)
                {
                    return NotFound(ApiResponse<DepartmentResponse>.ErrorResponse($"Department with ID {id} not found"));
                }

                var department = await _departmentService.UpdateAsync(id, request);

                // Create audit log with change tracking
                await _auditLogger.LogUpdateAsync("Department", id.ToString(), oldDepartment, department, $"Updated department: {department.Name}");

                return Ok(ApiResponse<DepartmentResponse>.SuccessResponse(
                    department,
                    "Department updated successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<DepartmentResponse>.ErrorResponse(ex.Message));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<DepartmentResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating department {DepartmentId}", id);
                return StatusCode(500, ApiResponse<DepartmentResponse>.ErrorResponse(
                    "An error occurred while updating the department"
                ));
            }
        }

        /// <summary>
        /// Delete a department (soft delete)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            try
            {
                var result = await _departmentService.DeleteAsync(id);

                // Create audit log
                await _auditLogger.LogAsync("Delete", "Department", id.ToString(), "Deleted department");

                return Ok(ApiResponse<bool>.SuccessResponse(
                    result,
                    "Department deleted successfully"
                ));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting department {DepartmentId}", id);
                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred while deleting the department"
                ));
            }
        }
    }
}
