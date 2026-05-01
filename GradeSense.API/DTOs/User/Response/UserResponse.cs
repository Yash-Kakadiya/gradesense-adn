namespace GradeSense.API.DTOs.User.Response;

public class UserResponse
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
    
    /// <summary>
    /// Faculty ID (only populated for Faculty role users)
    /// </summary>
    public int? FacultyId { get; set; }
    
    /// <summary>
    /// Student ID (only populated for Student role users)
    /// </summary>
    public int? StudentId { get; set; }
}