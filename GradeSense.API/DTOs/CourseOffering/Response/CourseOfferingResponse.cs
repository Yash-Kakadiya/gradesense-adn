namespace GradeSense.API.DTOs.CourseOffering.Response
{
    public class CourseOfferingResponse
    {
        public int Id { get; set; }
        public int SubjectId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public int BatchId { get; set; }
        public string BatchName { get; set; } = string.Empty;
        public int SubjectCoordinatorId { get; set; }
        public string SubjectCoordinatorName { get; set; } = string.Empty;
        public string SubjectCoordinatorEmployeeId { get; set; } = string.Empty;
        public int AcademicYear { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int? MaxEnrollment { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}