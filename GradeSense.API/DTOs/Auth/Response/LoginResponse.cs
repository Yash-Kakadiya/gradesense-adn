using GradeSense.API.DTOs.User.Response;

namespace GradeSense.API.DTOs.Auth.Response
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserResponse User { get; set; } = null!;
    }
}
