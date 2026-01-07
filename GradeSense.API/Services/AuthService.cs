using GradeSense.API.DTOs.Auth.Request;
using GradeSense.API.DTOs.Auth.Response;
using GradeSense.API.DTOs.User.Response;
using GradeSense.API.Helpers;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;
using System.Security.Claims;

namespace GradeSense.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtTokenGenerator _jwtTokenGenerator;
        private readonly JwtSettings _jwtSettings;

        // In-memory storage for refresh tokens (In production, use Redis or Database)
        private static readonly Dictionary<string, RefreshTokenData> _refreshTokens = new();

        // Token blacklist for logout (In production, use Redis with expiry)
        private static readonly HashSet<string> _revokedTokens = new();

        public AuthService(
            IUserRepository userRepository,
            JwtTokenGenerator jwtTokenGenerator,
            JwtSettings jwtSettings)
        {
            _userRepository = userRepository;
            _jwtTokenGenerator = jwtTokenGenerator;
            _jwtSettings = jwtSettings;
        }

        /// <summary>
        /// Authenticate user and generate tokens
        /// </summary>
        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            // 1. Find user by email
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            // 2. Verify password
            if (!PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password");
            }

            // 3. Check if account is active
            if (!user.IsActive)
            {
                throw new UnauthorizedAccessException("Account is inactive. Please contact administrator.");
            }

            // 4. Check if account is deleted (soft delete)
            if (user.DeletedAt.HasValue)
            {
                throw new UnauthorizedAccessException("Account has been deleted. Please contact administrator.");
            }

            // 5. Generate access token
            var accessToken = _jwtTokenGenerator.GenerateAccessToken(user);

            // 6. Generate refresh token
            var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

            // 7. Calculate expiry (longer if "Remember Me" is checked)
            var refreshTokenExpiry = request.RememberMe
                ? DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays * 4) // 28 days if remember me
                : DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays);    // 7 days normally

            // 8. Store refresh token (in production, store in Redis or Database)
            _refreshTokens[refreshToken] = new RefreshTokenData
            {
                UserId = user.Id,
                Token = refreshToken,
                ExpiresAt = refreshTokenExpiry,
                CreatedAt = DateTime.UtcNow,
                CreatedByIp = "127.0.0.1" // In real app, get from HttpContext
            };

            // 9. Clean up expired refresh tokens (garbage collection)
            CleanupExpiredRefreshTokens();

            // 10. Return login response
            return new LoginResponse
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
                User = new UserResponse
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role,
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                }
            };
        }

        /// <summary>
        /// Refresh access token using refresh token
        /// </summary>
        public async Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request)
        {
            // 1. Validate the access token (structure, not expiry)
            var principal = _jwtTokenGenerator.ValidateToken(request.Token);
            if (principal == null)
            {
                throw new UnauthorizedAccessException("Invalid access token");
            }

            // 2. Extract user ID from token
            var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("Invalid token claims");
            }

            // 3. Validate refresh token exists
            if (!_refreshTokens.TryGetValue(request.RefreshToken, out var refreshTokenData))
            {
                throw new UnauthorizedAccessException("Invalid refresh token");
            }

            // 4. Check if refresh token belongs to the user
            if (refreshTokenData.UserId != userId)
            {
                throw new UnauthorizedAccessException("Token mismatch");
            }

            // 5. Check if refresh token has expired
            if (refreshTokenData.ExpiresAt < DateTime.UtcNow)
            {
                _refreshTokens.Remove(request.RefreshToken);
                throw new UnauthorizedAccessException("Refresh token expired. Please login again.");
            }

            // 6. Get user from database (ensure still exists and active)
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                throw new UnauthorizedAccessException("User not found");
            }

            if (!user.IsActive || user.DeletedAt.HasValue)
            {
                throw new UnauthorizedAccessException("User account is inactive or deleted");
            }

            // 7. Generate new access token
            var newAccessToken = _jwtTokenGenerator.GenerateAccessToken(user);

            // 8. Generate new refresh token (rotation for security)
            var newRefreshToken = _jwtTokenGenerator.GenerateRefreshToken();

            // 9. Remove old refresh token
            _refreshTokens.Remove(request.RefreshToken);

            // 10. Store new refresh token
            _refreshTokens[newRefreshToken] = new RefreshTokenData
            {
                UserId = user.Id,
                Token = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays),
                CreatedAt = DateTime.UtcNow,
                CreatedByIp = "127.0.0.1" // In real app, get from HttpContext
            };

            // 11. Return new tokens
            return new TokenResponse
            {
                Token = newAccessToken,
                RefreshToken = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes)
            };
        }

        /// <summary>
        /// Logout user (revoke tokens)
        /// </summary>
        public Task<bool> LogoutAsync(string token)
        {
            // Add token to blacklist (in production, use Redis with TTL)
            if (!string.IsNullOrEmpty(token))
            {
                _revokedTokens.Add(token);
            }

            // Remove any refresh tokens associated with this access token
            var userId = _jwtTokenGenerator.GetUserIdFromToken(token);
            if (userId.HasValue)
            {
                var userRefreshTokens = _refreshTokens
                    .Where(x => x.Value.UserId == userId.Value)
                    .Select(x => x.Key)
                    .ToList();

                foreach (var refreshToken in userRefreshTokens)
                {
                    _refreshTokens.Remove(refreshToken);
                }
            }

            return Task.FromResult(true);
        }

        /// <summary>
        /// Revoke a specific refresh token
        /// </summary>
        public Task<bool> RevokeRefreshTokenAsync(string refreshToken)
        {
            if (_refreshTokens.ContainsKey(refreshToken))
            {
                _refreshTokens.Remove(refreshToken);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }

        /// <summary>
        /// Check if token is revoked (for middleware)
        /// </summary>
        public static bool IsTokenRevoked(string token)
        {
            return _revokedTokens.Contains(token);
        }

        /// <summary>
        /// Clean up expired refresh tokens (garbage collection)
        /// </summary>
        private void CleanupExpiredRefreshTokens()
        {
            var expiredTokens = _refreshTokens
                .Where(x => x.Value.ExpiresAt < DateTime.UtcNow)
                .Select(x => x.Key)
                .ToList();

            foreach (var token in expiredTokens)
            {
                _refreshTokens.Remove(token);
            }

            // Also clean up old revoked tokens (keep only last hour)
            var oneHourAgo = DateTime.UtcNow.AddHours(-1);
            // Note: HashSet doesn't have timestamp, so in production use Redis with TTL
        }

        /// <summary>
        /// Internal class to store refresh token data
        /// </summary>
        private class RefreshTokenData
        {
            public int UserId { get; set; }
            public string Token { get; set; } = string.Empty;
            public DateTime ExpiresAt { get; set; }
            public DateTime CreatedAt { get; set; }
            public string? CreatedByIp { get; set; }
        }
    }
}
