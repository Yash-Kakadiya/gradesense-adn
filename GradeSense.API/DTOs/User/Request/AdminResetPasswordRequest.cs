namespace GradeSense.API.DTOs.User.Request;

public class AdminResetPasswordRequest
{
    public string NewPassword { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
}
