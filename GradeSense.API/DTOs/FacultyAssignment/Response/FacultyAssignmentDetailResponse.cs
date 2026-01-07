namespace GradeSense.API.DTOs.FacultyAssignment.Response
{
    public class FacultyAssignmentDetailResponse
    {
        public int Id { get; set; }
        public int CourseOfferingId { get; set; }
        public string SubjectCode { get; set; } = string.Empty;
        public string SubjectName { get; set; } = string.Empty;
        public decimal SubjectCredit { get; set; }
        public string BatchName { get; set; } = string.Empty;
        public int BatchSemester { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public int AcademicYear { get; set; }
        public int FacultyId { get; set; }
        public string FacultyName { get; set; } = string.Empty;
        public string FacultyEmployeeId { get; set; } = string.Empty;
        public string FacultyEmail { get; set; } = string.Empty;
        public string FacultyDesignation { get; set; } = string.Empty;
        public string? Role { get; set; }
        public DateTime? AssignmentDate { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}