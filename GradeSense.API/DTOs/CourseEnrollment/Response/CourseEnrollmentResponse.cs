namespace GradeSense.API.DTOs.CourseEnrollment.Response
{
    public class CourseEnrollmentResponse
    {
        public int Id { get; set; }
        public int CourseOfferingId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string BatchName { get; set; } = string.Empty;
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string? RollNumber { get; set; }
        public string? PersonalEmail { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime? EnrollmentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? AttendancePercentage { get; set; }
        public string? Grade { get; set; }
        public decimal? GradePoints { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}