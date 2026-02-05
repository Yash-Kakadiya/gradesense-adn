namespace GradeSense.API.DTOs.Export;

#region User Export DTOs

/// <summary>
/// User CSV export (from ListResponse)
/// </summary>
public class UserCsvExport
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PersonalEmail { get; set; } = string.Empty;
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = string.Empty;
    public string IsActive { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
}

/// <summary>
/// User Excel export (from DetailResponse)
/// </summary>
public class UserExcelExport
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PersonalEmail { get; set; } = string.Empty;
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = string.Empty;
    public string IsActive { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    // Related info
    public string? FacultyEmployeeId { get; set; }
    public string? FacultyDepartment { get; set; }
    public string? FacultyDesignation { get; set; }
    public string? StudentEnrollmentNumber { get; set; }
    public string? StudentDepartment { get; set; }
    public int? StudentCurrentSemester { get; set; }
    public decimal? StudentCGPA { get; set; }
}

#endregion

#region Faculty Export DTOs

/// <summary>
/// Faculty CSV export (from ListResponse)
/// </summary>
public class FacultyCsvExport
{
    public int Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PersonalEmail { get; set; } = string.Empty;
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? Designation { get; set; }
    public string IsActive { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
}

/// <summary>
/// Faculty Excel export (from DetailResponse)
/// </summary>
public class FacultyExcelExport
{
    public int Id { get; set; }
    public string EmployeeId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PersonalEmail { get; set; } = string.Empty;
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? DepartmentCode { get; set; }
    public string? Designation { get; set; }
    public DateOnly? JoiningDate { get; set; }
    public string? Qualification { get; set; }
    public string? Specialization { get; set; }
    public string IsActive { get; set; } = string.Empty;
    public int AssignedCoursesCount { get; set; }
    public int CoordinatingBatchesCount { get; set; }
    public int CoordinatingCoursesCount { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

#endregion

#region Student Export DTOs

/// <summary>
/// Student CSV export (from ListResponse)
/// </summary>
public class StudentCsvExport
{
    public int Id { get; set; }
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PersonalEmail { get; set; } = string.Empty;
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int CurrentSemester { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? CGPA { get; set; }
    public string IsActive { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
}

/// <summary>
/// Student Excel export (from DetailResponse)
/// </summary>
public class StudentExcelExport
{
    public int Id { get; set; }
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string PersonalEmail { get; set; } = string.Empty;
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public int AdmissionYear { get; set; }
    public int CurrentSemester { get; set; }
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? DepartmentCode { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal? CGPA { get; set; }
    public string IsActive { get; set; } = string.Empty;
    public int EnrolledCoursesCount { get; set; }
    public int CompletedCoursesCount { get; set; }
    public int ActiveCoursesCount { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

#endregion

#region Department Export DTOs

/// <summary>
/// Department CSV export
/// </summary>
public class DepartmentCsvExport
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public string? HODName { get; set; }
    public string IsActive { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
}

/// <summary>
/// Department Excel export (from DetailResponse)
/// </summary>
public class DepartmentExcelExport
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public int? HODUserId { get; set; }
    public string? HODName { get; set; }
    public string? HODEmail { get; set; }
    public string IsActive { get; set; } = string.Empty;
    public int FacultyCount { get; set; }
    public int StudentCount { get; set; }
    public int SubjectCount { get; set; }
    public int BatchCount { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

#endregion

#region Batch Export DTOs

/// <summary>
/// Batch CSV export (from ListResponse)
/// </summary>
public class BatchCsvExport
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Semester { get; set; }
    public int AcademicYear { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? ClassCoordinatorName { get; set; }
    public string? Division { get; set; }
    public string IsActive { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
}

/// <summary>
/// Batch Excel export (from DetailResponse)
/// </summary>
public class BatchExcelExport
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Semester { get; set; }
    public int AcademicYear { get; set; }
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string? DepartmentCode { get; set; }
    public int? ClassCoordinatorId { get; set; }
    public string? ClassCoordinatorName { get; set; }
    public string? ClassCoordinatorEmail { get; set; }
    public string? ClassCoordinatorEmployeeId { get; set; }
    public string? Division { get; set; }
    public string IsActive { get; set; } = string.Empty;
    public int CourseOfferingsCount { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

#endregion

#region Subject Export DTOs

/// <summary>
/// Subject CSV export (from ListResponse)
/// </summary>
public class SubjectCsvExport
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal Credit { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int? Semester { get; set; }
    public string? SubjectType { get; set; }
    public string IsElective { get; set; } = string.Empty;
    public string IsActive { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
}

/// <summary>
/// Subject Excel export (from DetailResponse)
/// </summary>
public class SubjectExcelExport
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
    public string IsElective { get; set; } = string.Empty;
    public int? PrerequisiteSubjectId { get; set; }
    public string? PrerequisiteSubjectCode { get; set; }
    public string? PrerequisiteSubjectName { get; set; }
    public string? Description { get; set; }
    public string IsActive { get; set; } = string.Empty;
    public int SubjectUnitsCount { get; set; }
    public int CourseOfferingsCount { get; set; }
    public int DependentSubjectsCount { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

#endregion

#region Course Offering Export DTOs

/// <summary>
/// Course Offering CSV export (from ListResponse)
/// </summary>
public class CourseOfferingCsvExport
{
    public int Id { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string BatchName { get; set; } = string.Empty;
    public string SubjectCoordinatorName { get; set; } = string.Empty;
    public int AcademicYear { get; set; }
    public int? MaxEnrollment { get; set; }
    public string IsActive { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
}

/// <summary>
/// Course Offering Excel export (from DetailResponse)
/// </summary>
public class CourseOfferingExcelExport
{
    public int Id { get; set; }
    public int SubjectId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public decimal SubjectCredit { get; set; }
    public string SubjectDepartmentName { get; set; } = string.Empty;
    public int BatchId { get; set; }
    public string BatchName { get; set; } = string.Empty;
    public int BatchSemester { get; set; }
    public string BatchDepartmentName { get; set; } = string.Empty;
    public int SubjectCoordinatorId { get; set; }
    public string SubjectCoordinatorName { get; set; } = string.Empty;
    public string SubjectCoordinatorEmployeeId { get; set; } = string.Empty;
    public string SubjectCoordinatorEmail { get; set; } = string.Empty;
    public int AcademicYear { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public int? MaxEnrollment { get; set; }
    public string IsActive { get; set; } = string.Empty;
    public int CourseEnrollmentsCount { get; set; }
    public int ActiveEnrollmentsCount { get; set; }
    public int EvaluationSchemesCount { get; set; }
    public int FacultyAssignmentsCount { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

#endregion

#region Evaluation Scheme Export DTOs

/// <summary>
/// Evaluation Scheme CSV export (from ListResponse)
/// </summary>
public class EvaluationSchemeCsvExport
{
    public int Id { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string BatchName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal TotalMarks { get; set; }
    public decimal PassingMarks { get; set; }
    public decimal Weight { get; set; }
    public string? EvaluationType { get; set; }
    public string IsActive { get; set; } = string.Empty;
    public DateTime? CreatedAt { get; set; }
}

/// <summary>
/// Evaluation Scheme Excel export (from DetailResponse)
/// </summary>
public class EvaluationSchemeExcelExport
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
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal TotalMarks { get; set; }
    public decimal PassingMarks { get; set; }
    public decimal Weight { get; set; }
    public string? EvaluationType { get; set; }
    public string IsActive { get; set; } = string.Empty;
    public int AssessmentItemsCount { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

#endregion

#region Audit Log Export DTOs

/// <summary>
/// Audit Log CSV export (from ListResponse)
/// </summary>
public class AuditLogCsvExport
{
    public long Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string ActorUserName { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string? ChangedFields { get; set; }
    public DateTime? OccurredAt { get; set; }
    public string? IPAddress { get; set; }
}

/// <summary>
/// Audit Log Excel export (from DetailResponse)
/// </summary>
public class AuditLogExcelExport
{
    public long Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public int ActorUserId { get; set; }
    public string ActorUserName { get; set; } = string.Empty;
    public string ActorUserEmail { get; set; } = string.Empty;
    public string ActorUserRole { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string? ChangedFields { get; set; }
    public DateTime? OccurredAt { get; set; }
    public string? IPAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? SessionId { get; set; }
    public string? Reason { get; set; }
    public DateTime? CreatedAt { get; set; }
}

#endregion
