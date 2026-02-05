namespace GradeSense.API.DTOs.Faculty.Response
{
    public class FacultyListResponse
    {
        public int Id { get; set; }
        public string EmployeeId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string PersonalEmail { get; set; } = string.Empty;
        public string? InstitutionalEmail { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ProfileImagePath { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string? Designation { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}