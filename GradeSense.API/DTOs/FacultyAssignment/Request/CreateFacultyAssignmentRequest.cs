namespace GradeSense.API.DTOs.FacultyAssignment.Request
{
    public class CreateFacultyAssignmentRequest
    {
        public int CourseOfferingId { get; set; }
        public int FacultyId { get; set; }
        public string? Role { get; set; }
        public DateTime? AssignmentDate { get; set; }
    }
}