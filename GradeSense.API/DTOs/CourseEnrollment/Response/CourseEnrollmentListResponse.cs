namespace GradeSense.API.DTOs.CourseEnrollment.Response
{
    public class CourseEnrollmentListResponse
    {
        public int Id { get; set; }
        public int StudentId { get; set; }
        public int CourseOfferingId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string? SubjectDescription { get; set; }
        public decimal Credits { get; set; }
        public string BatchName { get; set; } = string.Empty;
        public int Semester { get; set; }
        public int AcademicYear { get; set; }
        public string? FacultyName { get; set; }
        public bool IsActive { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string? RollNumber { get; set; }
        public string? PersonalEmail { get; set; }
        public string? PhoneNumber { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public DateTime? EnrollmentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? AttendancePercentage { get; set; }
        public decimal AverageScore { get; set; }
        public string? Grade { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}