namespace GradeSense.API.DTOs.Department.Response
{
    public class DepartmentResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public int? HODUserId { get; set; }
        public string? HODName { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
