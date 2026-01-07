namespace GradeSense.API.DTOs.CourseOffering.Response
{
    public class CourseOfferingListResponse
    {
        public int Id { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string BatchName { get; set; } = string.Empty;
        public string SubjectCoordinatorName { get; set; } = string.Empty;
        public int AcademicYear { get; set; }
        public int? MaxEnrollment { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}