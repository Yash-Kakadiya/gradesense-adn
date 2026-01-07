namespace GradeSense.API.DTOs.CourseEnrollment.Request
{
    public class UpdateCourseEnrollmentRequest
    {
        public string? RollNumber { get; set; }
        public string? Status { get; set; }
        public decimal? AttendancePercentage { get; set; }
        public string? Grade { get; set; }
        public decimal? GradePoints { get; set; }
    }
}