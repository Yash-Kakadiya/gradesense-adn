namespace GradeSense.API.DTOs.Student.Request
{
    public class UpdateStudentRequest
    {
        public string? EnrollmentNumber { get; set; }
        public int? AdmissionYear { get; set; }
        public int? CurrentSemester { get; set; }
        public int? DepartmentId { get; set; }
        public string? Status { get; set; }
        public decimal? CGPA { get; set; }
    }
}