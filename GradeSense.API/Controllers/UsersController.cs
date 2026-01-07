using Microsoft.AspNetCore.Mvc;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.DTOs.User.Request;
using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.User.Response;
using Microsoft.AspNetCore.Authorization;

namespace GradeSense.API.Controllers;

[ApiController]
[Route("api/[controller]")]
//[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Get all users with filtering and pagination
    /// </summary>
    /// <param name="filter">Filter parameters</param>
    /// <returns>Paginated list of users</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<DTOs.User.Response.UserListResponse>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedResponse<DTOs.User.Response.UserListResponse>>>> GetAll([FromQuery] UserFilterRequest filter)
    {
        try
        {
            var result = await _userService.GetAllAsync(filter);
            return Ok(ApiResponse<PagedResponse<DTOs.User.Response.UserListResponse>>.SuccessResponse(
                result,
                "Users retrieved successfully"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users");
            return StatusCode(500, ApiResponse<PagedResponse<DTOs.User.Response.UserListResponse>>.ErrorResponse(
                "An error occurred while retrieving users"
            ));
        }
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User details</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<DTOs.User.Response.UserDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<DTOs.User.Response.UserDetailResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<DTOs.User.Response.UserDetailResponse>>> GetById(int id)
    {
        try
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound(ApiResponse<DTOs.User.Response.UserDetailResponse>.ErrorResponse(
                    $"User with ID {id} not found"
                ));
            }

            return Ok(ApiResponse<DTOs.User.Response.UserDetailResponse>.SuccessResponse(
                user,
                "User retrieved successfully"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", id);
            return StatusCode(500, ApiResponse<DTOs.User.Response.UserDetailResponse>.ErrorResponse(
                "An error occurred while retrieving the user"
            ));
        }
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    /// <param name="request">User creation data</param>
    /// <returns>Created user</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<DTOs.User.Response.UserResponse>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<DTOs.User.Response.UserResponse>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<DTOs.User.Response.UserResponse>>> Create([FromBody] CreateUserRequest request)
    {
        try
        {

            var user = await _userService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = user.Id },
                ApiResponse<DTOs.User.Response.UserResponse>.SuccessResponse(
                    user,
                    "User created successfully"
                )
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<DTOs.User.Response.UserResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user");
            return StatusCode(500, ApiResponse<DTOs.User.Response.UserResponse>.ErrorResponse(
                "An error occurred while creating the user"
            ));
        }
    }

    /// <summary>
    /// Update an existing user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="request">User update data</param>
    /// <returns>Updated user</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<UserResponse>>> Update(int id, [FromBody] UpdateUserRequest request)
    {
        try
        {

            var user = await _userService.UpdateAsync(id, request);

            return Ok(ApiResponse<UserResponse>.SuccessResponse(
                user,
                "User updated successfully"
            ));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<UserResponse>.ErrorResponse(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<UserResponse>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, ApiResponse<UserResponse>.ErrorResponse(
                "An error occurred while updating the user"
            ));
        }
    }

    /// <summary>
    /// Change user password
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="request">Password change data</param>
    /// <returns>Success status</returns>
    [HttpPut("{id}/change-password")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
    {
        try
        {

            var result = await _userService.ChangePasswordAsync(id, request);

            return Ok(ApiResponse<bool>.SuccessResponse(
                result,
                "Password changed successfully"
            ));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<bool>.ErrorResponse(ex.Message));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ApiResponse<bool>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user {UserId}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                "An error occurred while changing the password"
            ));
        }
    }

    /// <summary>
    /// Delete a user (soft delete)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
    {
        try
        {
            var result = await _userService.DeleteAsync(id);

            return Ok(ApiResponse<bool>.SuccessResponse(
                result,
                "User deleted successfully"
            ));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<bool>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                "An error occurred while deleting the user"
            ));
        }
    }
}