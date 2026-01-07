using System.ComponentModel.DataAnnotations;

namespace GradeSense.API.DTOs.Auth.Request
{
    public class RefreshTokenRequest
    {
        [Required(ErrorMessage = "Access token is required")]
        public string Token { get; set; } = string.Empty;

        [Required(ErrorMessage = "Refresh token is required")]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
