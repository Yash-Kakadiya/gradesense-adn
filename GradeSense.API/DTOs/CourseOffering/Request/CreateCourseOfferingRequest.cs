namespace GradeSense.API.DTOs.CourseOffering.Request
{
    public class CreateCourseOfferingRequest
    {
        public int SubjectId { get; set; }
        public int BatchId { get; set; }
        public int SubjectCoordinatorId { get; set; }
        public int AcademicYear { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public int? MaxEnrollment { get; set; }
        public bool IsActive { get; set; } = true;
    }
}