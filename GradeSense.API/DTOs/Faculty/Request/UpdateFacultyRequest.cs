namespace GradeSense.API.DTOs.Faculty.Request
{
    public class UpdateFacultyRequest
    {
        public string? EmployeeId { get; set; }
        public int? DepartmentId { get; set; }
        public string? Designation { get; set; }
        public DateOnly? JoiningDate { get; set; }
        public string? Qualification { get; set; }
        public string? Specialization { get; set; }
    }
}