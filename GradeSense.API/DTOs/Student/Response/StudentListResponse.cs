namespace GradeSense.API.DTOs.Student.Response
{
    public class StudentListResponse
    {
        public int Id { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public int CurrentSemester { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? CGPA { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}