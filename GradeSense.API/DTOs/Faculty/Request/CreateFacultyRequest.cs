namespace GradeSense.API.DTOs.Faculty.Request
{
    public class CreateFacultyRequest
    {
        public int UserId { get; set; }
        public string EmployeeId { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public string? Designation { get; set; }
        public DateOnly? JoiningDate { get; set; }
        public string? Qualification { get; set; }
        public string? Specialization { get; set; }
    }
}
