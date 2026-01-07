namespace GradeSense.API.DTOs.CourseOffering.Response
{
    public class CourseOfferingDetailResponse
    {
        public int Id { get; set; }
        public int SubjectId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public decimal SubjectCredit { get; set; }
        public string SubjectDepartmentName { get; set; } = string.Empty;
        public int BatchId { get; set; }
        public string BatchName { get; set; } = string.Empty;
        public int BatchSemester { get; set; }
        public string BatchDepartmentName { get; set; } = string.Empty;
        public int SubjectCoordinatorId { get; set; }
        public string SubjectCoordinatorName { get; set; } = string.Empty;
        public string SubjectCoordinatorEmployeeId { get; set; } = string.Empty;
        public string SubjectCoordinatorEmail { get; set; } = string.Empty;
        public int AcademicYear { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int? MaxEnrollment { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Statistics
        public int CourseEnrollmentsCount { get; set; }
        public int ActiveEnrollmentsCount { get; set; }
        public int EvaluationSchemesCount { get; set; }
        public int FacultyAssignmentsCount { get; set; }
    }
}