namespace GradeSense.API.DTOs.Department.Request
{
    public class UpdateDepartmentRequest
    {
        public string? Name { get; set; }
        public string? Code { get; set; }
        public int? HODUserId { get; set; }
        public bool? IsActive { get; set; }
    }
}
