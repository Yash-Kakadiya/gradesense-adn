namespace GradeSense.API.DTOs.CourseEnrollment.Response
{
    public class CourseEnrollmentListResponse
    {
        public int Id { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string BatchName { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string? RollNumber { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? AttendancePercentage { get; set; }
        public string? Grade { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}