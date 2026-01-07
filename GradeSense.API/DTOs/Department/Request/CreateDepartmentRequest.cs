namespace GradeSense.API.DTOs.Department.Request
{
    public class CreateDepartmentRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public int? HODUserId { get; set; }
    }
}
