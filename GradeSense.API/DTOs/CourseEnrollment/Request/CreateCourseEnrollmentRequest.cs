namespace GradeSense.API.DTOs.CourseEnrollment.Request
{
    public class CreateCourseEnrollmentRequest
    {
        public int CourseOfferingId { get; set; }
        public int StudentId { get; set; }
        public string? RollNumber { get; set; }
        public DateTime? EnrollmentDate { get; set; }
        public string Status { get; set; } = "Active";
        public decimal? AttendancePercentage { get; set; }
        public string? Grade { get; set; }
        public decimal? GradePoints { get; set; }
    }
}