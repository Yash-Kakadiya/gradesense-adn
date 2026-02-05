namespace GradeSense.API.DTOs.Faculty.Response
{
    public class FacultyResponse
    {
        public int Id { get; set; }
        public string EmployeeId { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string? Designation { get; set; }
        public DateOnly? JoiningDate { get; set; }
        public string? Qualification { get; set; }
        public string? Specialization { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // User info
        public string FullName { get; set; } = string.Empty;
        public string PersonalEmail { get; set; } = string.Empty;
        public string? InstitutionalEmail { get; set; }
        public string? PhoneNumber { get; set; }
    }
}