namespace GradeSense.API.DTOs.User.Request;

public class UserFilterRequest
{
    public string? SearchTerm { get; set; }
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string SortBy { get; set; } = "Id";
    public string SortOrder { get; set; } = "asc"; // asc or desc
}