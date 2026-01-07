namespace GradeSense.API.DTOs.Faculty.Response
{
    public class FacultyListResponse
    {
        public int Id { get; set; }
        public string EmployeeId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string? Designation { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}