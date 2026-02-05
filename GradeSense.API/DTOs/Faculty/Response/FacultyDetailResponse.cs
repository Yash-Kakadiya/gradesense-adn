namespace GradeSense.API.DTOs.Faculty.Response
{
    public class FacultyDetailResponse
    {
        public int Id { get; set; }
        public string EmployeeId { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string? DepartmentCode { get; set; }
        public string? Designation { get; set; }
        public DateOnly? JoiningDate { get; set; }
        public string? Qualification { get; set; }
        public string? Specialization { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // User info
        public string FullName { get; set; } = string.Empty;
        public string PersonalEmail { get; set; } = string.Empty;
        public string? InstitutionalEmail { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ProfileImagePath { get; set; }
        public bool IsActive { get; set; }

        // Statistics
        public int AssignedCoursesCount { get; set; }
        public int CoordinatingBatchesCount { get; set; }
        public int CoordinatingCoursesCount { get; set; }
    }
}