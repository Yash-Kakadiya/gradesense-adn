namespace GradeSense.API.DTOs.Export;

#region Student Roster Export DTOs

/// <summary>
/// Student roster entry for CSV export
/// </summary>
public class StudentRosterCsvExport
{
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string BatchName { get; set; } = string.Empty;
    public int Semester { get; set; }
    public string EnrollmentStatus { get; set; } = string.Empty;
}

/// <summary>
/// Student roster entry for Excel export (with more details)
/// </summary>
public class StudentRosterExcelExport
{
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string BatchName { get; set; } = string.Empty;
    public int Semester { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public decimal? CurrentCGPA { get; set; }
    public decimal AttendancePercentage { get; set; }
    public decimal CurrentGradePercentage { get; set; }
    public string EnrollmentStatus { get; set; } = string.Empty;
    public string RiskStatus { get; set; } = string.Empty;
    public DateTime EnrolledDate { get; set; }
}

/// <summary>
/// Course header information for roster export
/// </summary>
public class CourseRosterHeaderInfo
{
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public int Credits { get; set; }
    public int Semester { get; set; }
    public string BatchName { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public string FacultyName { get; set; } = string.Empty;
    public int TotalStudents { get; set; }
    public DateTime GeneratedDate { get; set; }
}

#endregion

#region Faculty Grades Export DTOs

/// <summary>
/// Student grades for CSV export (one row per student-assessment)
/// </summary>
public class FacultyGradesCsvExport
{
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string AssessmentName { get; set; } = string.Empty;
    public decimal MaxMarks { get; set; }
    public string ObtainedMarks { get; set; } = string.Empty;
    public string Percentage { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// Student grades summary for Excel export
/// </summary>
public class FacultyGradesExcelExport
{
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string AssessmentName { get; set; } = string.Empty;
    public string AssessmentType { get; set; } = string.Empty;
    public decimal MaxMarks { get; set; }
    public decimal? ObtainedMarks { get; set; }
    public decimal? Percentage { get; set; }
    public decimal? WeightedScore { get; set; }
    public bool IsAbsent { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? GradedDate { get; set; }
    public string GradedBy { get; set; } = string.Empty;
}

/// <summary>
/// Assessment-wise student grades (for assessment report)
/// </summary>
public class AssessmentGradesExport
{
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public decimal MaxMarks { get; set; }
    public decimal? ObtainedMarks { get; set; }
    public decimal? Percentage { get; set; }
    public bool IsAbsent { get; set; }
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// Course grades header for faculty export
/// </summary>
public class FacultyGradesHeaderInfo
{
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public int Credits { get; set; }
    public int Semester { get; set; }
    public string BatchName { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public string FacultyName { get; set; } = string.Empty;
    public int TotalStudents { get; set; }
    public int AssessmentsCount { get; set; }
    public decimal ClassAverage { get; set; }
    public decimal HighestScore { get; set; }
    public decimal LowestScore { get; set; }
    public DateTime GeneratedDate { get; set; }
}

/// <summary>
/// Grade distribution summary
/// </summary>
public class GradeDistributionExport
{
    public string Grade { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}

#endregion

#region Faculty Attendance Export DTOs

/// <summary>
/// Student attendance for CSV export
/// </summary>
public class FacultyAttendanceCsvExport
{
    public string Date { get; set; } = string.Empty;
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Remarks { get; set; } = string.Empty;
}

/// <summary>
/// Student attendance for Excel export
/// </summary>
public class FacultyAttendanceExcelExport
{
    public DateTime Date { get; set; }
    public string Day { get; set; } = string.Empty;
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Remarks { get; set; } = string.Empty;
    public string RecordedBy { get; set; } = string.Empty;
}

/// <summary>
/// Student attendance summary for a course
/// </summary>
public class StudentAttendanceSummaryExport
{
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public int TotalClasses { get; set; }
    public int Present { get; set; }
    public int Absent { get; set; }
    public int Late { get; set; }
    public decimal AttendancePercentage { get; set; }
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// Attendance header for faculty export
/// </summary>
public class FacultyAttendanceHeaderInfo
{
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string BatchName { get; set; } = string.Empty;
    public int Semester { get; set; }
    public string AcademicYear { get; set; } = string.Empty;
    public string FacultyName { get; set; } = string.Empty;
    public int TotalStudents { get; set; }
    public int TotalClasses { get; set; }
    public decimal ClassAverageAttendance { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public DateTime GeneratedDate { get; set; }
}

#endregion

#region At-Risk Students Export DTOs

/// <summary>
/// At-risk student for CSV export
/// </summary>
public class AtRiskStudentCsvExport
{
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string RiskLevel { get; set; } = string.Empty;
    public decimal AttendancePercentage { get; set; }
    public decimal GradePercentage { get; set; }
    public string PrimaryRiskFactor { get; set; } = string.Empty;
}

/// <summary>
/// At-risk student for Excel export (detailed)
/// </summary>
public class AtRiskStudentExcelExport
{
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string StudentName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string BatchName { get; set; } = string.Empty;
    public int Semester { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
    public decimal AttendancePercentage { get; set; }
    public decimal GradePercentage { get; set; }
    public int MissedClasses { get; set; }
    public int FailingAssessments { get; set; }
    public string PrimaryRiskFactor { get; set; } = string.Empty;
    public string Recommendations { get; set; } = string.Empty;
}

/// <summary>
/// At-risk report header
/// </summary>
public class AtRiskReportHeaderInfo
{
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string BatchName { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public string FacultyName { get; set; } = string.Empty;
    public int TotalStudents { get; set; }
    public int AtRiskCount { get; set; }
    public int HighRiskCount { get; set; }
    public int MediumRiskCount { get; set; }
    public int LowRiskCount { get; set; }
    public DateTime GeneratedDate { get; set; }
}

#endregion

#region Filter Request DTOs

/// <summary>
/// Filter for faculty roster export
/// </summary>
public class FacultyRosterExportRequest
{
    public int CourseOfferingId { get; set; }
    public string? Status { get; set; }
}

/// <summary>
/// Filter for faculty grades export
/// </summary>
public class FacultyGradesExportRequest
{
    public int CourseOfferingId { get; set; }
    public int? AssessmentItemId { get; set; }
}

/// <summary>
/// Filter for faculty attendance export
/// </summary>
public class FacultyAttendanceExportRequest
{
    public int CourseOfferingId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

/// <summary>
/// Filter for at-risk students export
/// </summary>
public class FacultyAtRiskExportRequest
{
    public int CourseOfferingId { get; set; }
    public string? RiskLevel { get; set; }
}

#endregion
