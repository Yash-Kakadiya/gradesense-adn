namespace GradeSense.API.DTOs.Subject.Response
{
    public class SubjectListResponse
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Credit { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int? Semester { get; set; }
        public string? SubjectType { get; set; }
        public bool IsElective { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}