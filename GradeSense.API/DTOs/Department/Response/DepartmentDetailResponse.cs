namespace GradeSense.API.DTOs.Department.Response
{
    public class DepartmentDetailResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public int? HODUserId { get; set; }
        public string? HODName { get; set; }
        public string? HODEmail { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Statistics
        public int FacultyCount { get; set; }
        public int StudentCount { get; set; }
        public int SubjectCount { get; set; }
        public int BatchCount { get; set; }
    }
}
