namespace GradeSense.API.DTOs.Batch.Response
{
    public class BatchResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Semester { get; set; }
        public int AcademicYear { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int? ClassCoordinatorId { get; set; }
        public string? ClassCoordinatorName { get; set; }
        public string? Division { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}