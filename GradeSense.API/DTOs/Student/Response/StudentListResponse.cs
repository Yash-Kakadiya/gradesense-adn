namespace GradeSense.API.DTOs.Student.Response
{
    public class StudentListResponse
    {
        public int Id { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string PersonalEmail { get; set; } = string.Empty;
        public string? InstitutionalEmail { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ProfileImagePath { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int CurrentSemester { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public decimal? CGPA { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}