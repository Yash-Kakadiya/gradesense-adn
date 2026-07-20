using Microsoft.AspNetCore.Mvc;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.DTOs.User.Request;
using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.User.Response;
using Microsoft.AspNetCore.Authorization;

namespace GradeSense.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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
    /// Get server health
    /// </summary>
    /// <returns>Server health</returns>
    [HttpGet("/api/health")]
    [AllowAnonymous]
    public IActionResult Health()
    {
        return Ok(new { status = "ok", message = "Server is healthy", timestamp = DateTime.UtcNow.ToString("o") });
    }

    /// <summary>
    /// Get all users with filtering and pagination
    /// </summary>
    /// <param name="filter">Filter parameters</param>
    /// <returns>Paginated list of users</returns>
    [HttpGet]
    [Authorize(Roles = "Admin")]
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
    [Authorize(Roles = "Admin,Faculty,Student")]
    [ProducesResponseType(typeof(ApiResponse<DTOs.User.Response.UserDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<DTOs.User.Response.UserDetailResponse>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<DTOs.User.Response.UserDetailResponse>>> GetById(int id)
    {
        try
        {
            // Non-admin users can only access their own user record
            if (!User.IsInRole("Admin"))
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId != id)
                {
                    return Forbid();
                }
            }

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
    [Authorize(Roles = "Admin")]
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
    [Authorize(Roles = "Admin")]
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
    [Authorize(Roles = "Admin,Faculty,Student")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword(int id, [FromBody] ChangePasswordRequest request)
    {
        try
        {
            // Users can only change their own password (unless Admin)
            if (!User.IsInRole("Admin"))
            {
                var userIdClaim = User.FindFirst("sub")?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId) || userId != id)
                {
                    return Forbid();
                }
            }

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
            // Return 400 Bad Request instead of 401 for wrong current password
            // to prevent automatic logout by the frontend interceptor
            return BadRequest(ApiResponse<bool>.ErrorResponse(ex.Message));
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
    /// Admin reset user password (without requiring current password)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="request">New password data</param>
    /// <returns>Success status</returns>
    [HttpPut("{id}/admin-reset-password")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<bool>>> AdminResetPassword(int id, [FromBody] AdminResetPasswordRequest request)
    {
        try
        {
            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(ApiResponse<bool>.ErrorResponse("Passwords do not match"));
            }

            var result = await _userService.AdminResetPasswordAsync(id, request);

            // Create audit log
            await _auditLogger.LogAsync("AdminResetPassword", "User", id.ToString(), "Admin reset user password");

            return Ok(ApiResponse<bool>.SuccessResponse(
                result,
                "Password reset successfully"
            ));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<bool>.ErrorResponse(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password for user {UserId}", id);
            return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                "An error occurred while resetting the password"
            ));
        }
    }

    /// <summary>
    /// Delete a user (soft delete)
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
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

    #region Bulk Import

    /// <summary>
    /// Download user import template
    /// </summary>
    /// <returns>Excel template file</returns>
    [HttpGet("import/template")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetImportTemplate()
    {
        try
        {
            var templateBytes = await _userService.GetUserImportTemplateAsync();
            return File(templateBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "user_import_template.xlsx");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating user import template");
            return StatusCode(500, ApiResponse<string>.ErrorResponse("Failed to generate template"));
        }
    }

    /// <summary>
    /// Validate user import file
    /// </summary>
    /// <param name="file">Excel or CSV file</param>
    /// <returns>Validation results with preview</returns>
    [HttpPost("import/validate")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<DTOs.User.Request.BulkUserValidationResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<DTOs.User.Request.BulkUserValidationResponse>>> ValidateImport(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(ApiResponse<DTOs.User.Request.BulkUserValidationResponse>.ErrorResponse("No file uploaded"));
            }

            var extension = Path.GetExtension(file.FileName).ToLower();
            if (extension != ".xlsx" && extension != ".xls" && extension != ".csv")
            {
                return BadRequest(ApiResponse<DTOs.User.Request.BulkUserValidationResponse>.ErrorResponse("Invalid file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are supported"));
            }

            using var stream = file.OpenReadStream();
            var result = await _userService.ValidateUserImportAsync(stream, extension);

            return Ok(ApiResponse<DTOs.User.Request.BulkUserValidationResponse>.SuccessResponse(
                result,
                "File validated successfully"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating user import file");
            return StatusCode(500, ApiResponse<DTOs.User.Request.BulkUserValidationResponse>.ErrorResponse(
                "An error occurred while validating the file"
            ));
        }
    }

    /// <summary>
    /// Execute user import
    /// </summary>
    /// <param name="request">Import request with validated rows</param>
    /// <returns>Import results</returns>
    [HttpPost("import/execute")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<DTOs.Common.BulkOperationResponse<DTOs.User.Response.UserResponse>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ApiResponse<DTOs.Common.BulkOperationResponse<DTOs.User.Response.UserResponse>>>> ExecuteImport([FromBody] DTOs.User.Request.BulkUserImportRequest request)
    {
        try
        {
            if (request.Rows == null || !request.Rows.Any())
            {
                return BadRequest(ApiResponse<DTOs.Common.BulkOperationResponse<DTOs.User.Response.UserResponse>>.ErrorResponse("No rows to import"));
            }

            var result = await _userService.ImportUsersWithValidationAsync(request);

            // Create audit log
            await _auditLogger.LogAsync("BulkImport", "User", null, $"Bulk imported {result.SuccessCount} users, {result.ErrorCount} errors");

            return Ok(ApiResponse<DTOs.Common.BulkOperationResponse<DTOs.User.Response.UserResponse>>.SuccessResponse(
                result,
                $"Import completed: {result.SuccessCount} successful, {result.ErrorCount} errors"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing user import");
            return StatusCode(500, ApiResponse<DTOs.Common.BulkOperationResponse<DTOs.User.Response.UserResponse>>.ErrorResponse(
                "An error occurred while importing users"
            ));
        }
    }

    #endregion
}