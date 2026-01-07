using GradeSense.API.DTOs.Auth.Request;
using GradeSense.API.DTOs.Auth.Response;
using GradeSense.API.DTOs.Common;
using GradeSense.API.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GradeSense.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        /// <summary>
        /// Login with email and password
        /// </summary>
        /// <param name="request">Login credentials</param>
        /// <returns>JWT tokens and user information</returns>
        [HttpPost("login")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponse>), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
        {
            try
            {

                // Attempt login
                var result = await _authService.LoginAsync(request);

                // Log successful login
                _logger.LogInformation("User {Email} logged in successfully", request.Email);

                return Ok(ApiResponse<LoginResponse>.SuccessResponse(
                    result,
                    "Login successful"
                ));
            }
            catch (UnauthorizedAccessException ex)
            {
                // Log failed login attempt
                _logger.LogWarning("Failed login attempt for {Email}: {Message}", request.Email, ex.Message);

                return Unauthorized(ApiResponse<LoginResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                // Log unexpected error
                _logger.LogError(ex, "Error during login for {Email}", request.Email);

                return StatusCode(500, ApiResponse<LoginResponse>.ErrorResponse(
                    "An error occurred during login. Please try again later."
                ));
            }
        }

        /// <summary>
        /// Refresh access token using refresh token
        /// </summary>
        /// <param name="request">Token and refresh token</param>
        /// <returns>New JWT tokens</returns>
        [HttpPost("refresh")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<TokenResponse>), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<ApiResponse<TokenResponse>>> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                // Refresh tokens
                var result = await _authService.RefreshTokenAsync(request);

                _logger.LogInformation("Token refreshed successfully");

                return Ok(ApiResponse<TokenResponse>.SuccessResponse(
                    result,
                    "Token refreshed successfully"
                ));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning("Failed token refresh: {Message}", ex.Message);

                return Unauthorized(ApiResponse<TokenResponse>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing token");

                return StatusCode(500, ApiResponse<TokenResponse>.ErrorResponse(
                    "An error occurred while refreshing token"
                ));
            }
        }

        /// <summary>
        /// Logout (revoke refresh token and blacklist access token)
        /// </summary>
        /// <returns>Success status</returns>
        [HttpPost("logout")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<ApiResponse<bool>>> Logout()
        {
            try
            {
                // Extract token from Authorization header
                var token = HttpContext.Request.Headers["Authorization"]
                    .ToString()
                    .Replace("Bearer ", string.Empty);

                if (string.IsNullOrEmpty(token))
                {
                    return BadRequest(ApiResponse<bool>.ErrorResponse("No token provided"));
                }

                // Revoke token
                await _authService.LogoutAsync(token);

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                _logger.LogInformation("User {UserId} logged out successfully", userId);

                return Ok(ApiResponse<bool>.SuccessResponse(
                    true,
                    "Logged out successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during logout");

                return StatusCode(500, ApiResponse<bool>.ErrorResponse(
                    "An error occurred during logout"
                ));
            }
        }

        /// <summary>
        /// Get current authenticated user information
        /// </summary>
        /// <returns>Current user claims from token</returns>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public IActionResult GetCurrentUser()
        {
            try
            {
                // Extract claims from token
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                var name = User.FindFirst(ClaimTypes.Name)?.Value;
                var role = User.FindFirst(ClaimTypes.Role)?.Value;

                // Build response
                var userInfo = new
                {
                    Id = userId,
                    Email = email,
                    Name = name,
                    Role = role,
                    Claims = User.Claims.Select(c => new
                    {
                        Type = c.Type,
                        Value = c.Value
                    }).ToList()
                };

                return Ok(ApiResponse<object>.SuccessResponse(
                    userInfo,
                    "User information retrieved successfully"
                ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving current user");

                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "An error occurred while retrieving user information"
                ));
            }
        }

        /// <summary>
        /// Validate if a token is still valid (for client-side checking)
        /// </summary>
        /// <returns>Token validation status</returns>
        [HttpGet("validate")]
        [Authorize]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public IActionResult ValidateToken()
        {
            // If we reach here, token is valid (passed [Authorize])
            return Ok(ApiResponse<object>.SuccessResponse(
                new { Valid = true },
                "Token is valid"
            ));
        }

        /// <summary>
        /// Check if service is running (health check)
        /// </summary>
        [HttpGet("health")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public IActionResult HealthCheck()
        {
            return Ok(ApiResponse<object>.SuccessResponse(
                new
                {
                    Status = "Healthy",
                    Timestamp = DateTime.UtcNow,
                    Service = "GradeSense Auth API"
                },
                "Service is running"
            ));
        }
    }
}
