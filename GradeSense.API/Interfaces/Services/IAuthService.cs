using GradeSense.API.DTOs.Auth.Request;
using GradeSense.API.DTOs.Auth.Response;

namespace GradeSense.API.Interfaces.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task<TokenResponse> RefreshTokenAsync(RefreshTokenRequest request);
        Task<bool> LogoutAsync(string token);
        Task<bool> RevokeRefreshTokenAsync(string refreshToken);
    }
}
