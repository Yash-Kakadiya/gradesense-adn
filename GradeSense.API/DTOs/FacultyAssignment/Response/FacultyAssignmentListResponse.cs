namespace GradeSense.API.DTOs.FacultyAssignment.Response
{
    public class FacultyAssignmentListResponse
    {
        public int Id { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public string BatchName { get; set; } = string.Empty;
        public string FacultyName { get; set; } = string.Empty;
        public string FacultyEmployeeId { get; set; } = string.Empty;
        public string? Role { get; set; }
        public DateTime? AssignmentDate { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}