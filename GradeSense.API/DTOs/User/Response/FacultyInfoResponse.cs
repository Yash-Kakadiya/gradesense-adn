namespace GradeSense.API.DTOs.User.Response;

public class FacultyInfoResponse
{
    public string EmployeeId { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public DateTime? JoiningDate { get; set; }
    public string? Qualification { get; set; }
    public string? Specialization { get; set; }
}