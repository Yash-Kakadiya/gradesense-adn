namespace GradeSense.API.DTOs.Student.Response
{
    public class StudentDetailResponse
    {
        public int Id { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;
        public int AdmissionYear { get; set; }
        public int CurrentSemester { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string? DepartmentCode { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? CGPA { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // User info
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        // Statistics
        public int EnrolledCoursesCount { get; set; }
        public int CompletedCoursesCount { get; set; }
        public int ActiveCoursesCount { get; set; }
    }
}