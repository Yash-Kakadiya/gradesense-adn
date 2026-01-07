namespace GradeSense.API.DTOs.Subject.Response
{
    public class SubjectDetailResponse
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public decimal Credit { get; set; }
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string? DepartmentCode { get; set; }
        public int? Semester { get; set; }
        public string? SubjectType { get; set; }
        public bool IsElective { get; set; }
        public int? PrerequisiteSubjectId { get; set; }
        public string? PrerequisiteSubjectCode { get; set; }
        public string? PrerequisiteSubjectName { get; set; }
        public string? Description { get; set; }
        public string? Syllabus { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Statistics
        public int SubjectUnitsCount { get; set; }
        public int CourseOfferingsCount { get; set; }
        public int DependentSubjectsCount { get; set; }
    }
}