namespace GradeSense.API.DTOs.CourseEnrollment.Response
{
    public class CourseEnrollmentDetailResponse
    {
        public int Id { get; set; }
        public int CourseOfferingId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public decimal SubjectCredit { get; set; }
        public string BatchName { get; set; } = string.Empty;
        public int BatchSemester { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int AcademicYear { get; set; }
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string EnrollmentNumber { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;
        public string? RollNumber { get; set; }
        public DateTime? EnrollmentDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? AttendancePercentage { get; set; }
        public string? Grade { get; set; }
        public decimal? GradePoints { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Statistics
        public int StudentMarksCount { get; set; }
        public int AttendanceRecordsCount { get; set; }
        public int PredictionsCount { get; set; }
    }
}