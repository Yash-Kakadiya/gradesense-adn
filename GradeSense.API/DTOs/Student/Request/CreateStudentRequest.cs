namespace GradeSense.API.DTOs.Student.Request
{
    public class CreateStudentRequest
    {
        public int UserId { get; set; }
        public string EnrollmentNumber { get; set; } = string.Empty;
        public int AdmissionYear { get; set; }
        public int CurrentSemester { get; set; }
        public int DepartmentId { get; set; }
        public string Status { get; set; } = "Active";
        public decimal? CGPA { get; set; }
    }
}