namespace GradeSense.API.DTOs.Subject.Request
{
    public class UpdateSubjectRequest
    {
        public string? Code { get; set; }
        public string? Name { get; set; }
        public decimal? Credit { get; set; }
        public int? DepartmentId { get; set; }
        public int? Semester { get; set; }
        public string? SubjectType { get; set; }
        public bool? IsElective { get; set; }
        public int? PrerequisiteSubjectId { get; set; }
        public string? Description { get; set; }
        public string? Syllabus { get; set; }
        public bool? IsActive { get; set; }
    }
}