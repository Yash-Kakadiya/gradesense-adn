using Microsoft.AspNetCore.Mvc;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.DTOs.User.Request;
using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.User.Response;
using Microsoft.AspNetCore.Authorization;

namespace GradeSense.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;
    private readonly IAuditLogger _auditLogger;

    public UsersController(IUserService userService, ILogger<UsersController> logger, IAuditLogger auditLogger)
    {
        _userService = userService;
        _logger = logger;
        _auditLogger = auditLogger;
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

            // Create audit log
            await _auditLogger.LogAsync("Create", "User", user.Id.ToString(), $"Created user: {user.PersonalEmail} ({user.Role})");

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
            // Get old data for audit trail
            var oldUser = await _userService.GetByIdAsync(id);
            if (oldUser == null)
            {
                return NotFound(ApiResponse<UserResponse>.ErrorResponse($"User with ID {id} not found"));
            }

            var user = await _userService.UpdateAsync(id, request);

            // Create audit log with change tracking
            await _auditLogger.LogUpdateAsync("User", id.ToString(), oldUser, user, $"Updated user: {user.PersonalEmail}");

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

            // Create audit log
            await _auditLogger.LogAsync("Delete", "User", id.ToString(), "Deleted user");

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

    /// <summary>
    /// Upload profile image for a user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="file">Image file</param>
    /// <returns>Profile image path</returns>
    [HttpPost("{id}/profile-image")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<string>>> UploadProfileImage(int id, IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("No file uploaded"));
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid file type. Allowed: jpg, jpeg, png, gif, webp"));
            }

            // Validate file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("File size must be less than 5MB"));
            }

            // Check if user exists
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound(ApiResponse<string>.ErrorResponse($"User with ID {id} not found"));
            }

            // Create profiles directory if it doesn't exist
            var profilesPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "profiles");
            if (!Directory.Exists(profilesPath))
            {
                Directory.CreateDirectory(profilesPath);
            }

            // Delete old profile image if exists
            if (!string.IsNullOrEmpty(user.ProfileImagePath))
            {
                var oldFilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.ProfileImagePath.TrimStart('/'));
                if (System.IO.File.Exists(oldFilePath))
                {
                    System.IO.File.Delete(oldFilePath);
                }
            }

            // Generate unique filename
            var fileName = $"{id}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
            var filePath = Path.Combine(profilesPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Update user's profile image path
            var relativePath = $"/profiles/{fileName}";
            await _userService.UpdateProfileImageAsync(id, relativePath);

            // Create audit log
            await _auditLogger.LogAsync("Update", "User", id.ToString(), "Updated profile image");

            return Ok(ApiResponse<string>.SuccessResponse(
                relativePath,
                "Profile image uploaded successfully"
            ));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<string>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading profile image for user {UserId}", id);
            return StatusCode(500, ApiResponse<string>.ErrorResponse(
                "An error occurred while uploading the profile image"
            ));
        }
    }

    /// <summary>
    /// Delete profile image for a user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{id}/profile-image")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteProfileImage(int id)
    {
        try
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound(ApiResponse<bool>.ErrorResponse($"User with ID {id} not found"));
            }

            // Delete file if exists
            if (!string.IsNullOrEmpty(user.ProfileImagePath))
            {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", user.ProfileImagePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            // Update user's profile image path to null
            await _userService.UpdateProfileImageAsync(id, null);

            // Create audit log
            await _auditLogger.LogAsync("Update", "User", id.ToString(), "Deleted profile image");

            return Ok(ApiResponse<bool>.SuccessResponse(
                true,
                "Profile image deleted successfully"
            ));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<bool>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting profile image for user {UserId}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                "An error occurred while deleting the profile image"
            ));
        }
    }
}