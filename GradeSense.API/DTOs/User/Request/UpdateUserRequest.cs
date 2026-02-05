namespace GradeSense.API.DTOs.User.Request;

public class UpdateUserRequest
{
    public string? PersonalEmail { get; set; }
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ProfileImagePath { get; set; }
    public string? FullName { get; set; }
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
}