namespace GradeSense.API.DTOs.CourseEnrollment.Request
{
    public class BulkEnrollRequest
    {
        public int CourseOfferingId { get; set; }
        public List<int> StudentIds { get; set; } = new();
    }

    public class BulkEnrollResponse
    {
        public int TotalRequested { get; set; }
        public int SuccessfulEnrollments { get; set; }
        public int FailedEnrollments { get; set; }
        public List<string> Errors { get; set; } = new();
    }
}
