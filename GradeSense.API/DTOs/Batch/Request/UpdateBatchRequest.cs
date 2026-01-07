namespace GradeSense.API.DTOs.Batch.Request
{
    public class UpdateBatchRequest
    {
        public string? Name { get; set; }
        public int? Semester { get; set; }
        public int? AcademicYear { get; set; }
        public int? DepartmentId { get; set; }
        public int? ClassCoordinatorId { get; set; }
        public string? Division { get; set; }
        public bool? IsActive { get; set; }
    }
}