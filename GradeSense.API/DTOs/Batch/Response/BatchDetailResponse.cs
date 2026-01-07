namespace GradeSense.API.DTOs.Batch.Response
{
    public class BatchDetailResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Semester { get; set; }
        public int AcademicYear { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string? DepartmentCode { get; set; }
        public int? ClassCoordinatorId { get; set; }
        public string? ClassCoordinatorName { get; set; }
        public string? ClassCoordinatorEmail { get; set; }
        public string? ClassCoordinatorEmployeeId { get; set; }
        public string? Division { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Statistics
        public int CourseOfferingsCount { get; set; }
    }
}