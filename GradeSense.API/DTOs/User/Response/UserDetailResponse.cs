namespace GradeSense.API.DTOs.User.Response;

public class UserDetailResponse
{
    public int Id { get; set; }
    public string PersonalEmail { get; set; } = string.Empty;
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ProfileImagePath { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }

    // Related data (conditionally populated based on role)
    public FacultyInfoResponse? FacultyInfo { get; set; }
    public StudentInfoResponse? StudentInfo { get; set; }
}