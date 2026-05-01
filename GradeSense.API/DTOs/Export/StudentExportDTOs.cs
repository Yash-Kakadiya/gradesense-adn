namespace GradeSense.API.DTOs.Export;

#region Transcript Export DTOs

/// <summary>
/// Student transcript entry for CSV export
/// </summary>
public class TranscriptCsvExport
{
    public string Semester { get; set; } = string.Empty;
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public int Credits { get; set; }
    public string SubjectType { get; set; } = string.Empty;
    public decimal ObtainedMarks { get; set; }
    public decimal TotalMarks { get; set; }
    public string Percentage { get; set; } = string.Empty;
    public string Grade { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// Student transcript for Excel export (with more details)
/// </summary>
public class TranscriptExcelExport
{
    public int Semester { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public int Credits { get; set; }
    public string SubjectType { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public decimal ObtainedMarks { get; set; }
    public decimal TotalMarks { get; set; }
    public decimal Percentage { get; set; }
    public string Grade { get; set; } = string.Empty;
    public decimal GradePoints { get; set; }
    public string FacultyName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// Transcript header information for Excel
/// </summary>
public class TranscriptHeaderInfo
{
    public string StudentName { get; set; } = string.Empty;
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string BatchName { get; set; } = string.Empty;
    public int CurrentSemester { get; set; }
    public decimal? CGPA { get; set; }
    public decimal? TotalCreditsEarned { get; set; }
    public DateTime GeneratedDate { get; set; }
}

#endregion

#region Grades Export DTOs

/// <summary>
/// Course grades CSV export
/// </summary>
public class GradesCsvExport
{
    public string AssessmentName { get; set; } = string.Empty;
    public string AssessmentType { get; set; } = string.Empty;
    public int MaxMarks { get; set; }
    public string ObtainedMarks { get; set; } = string.Empty;
    public string Percentage { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// Course grades Excel export (with more details)
/// </summary>
public class GradesExcelExport
{
    public string AssessmentName { get; set; } = string.Empty;
    public string AssessmentType { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int MaxMarks { get; set; }
    public decimal? ObtainedMarks { get; set; }
    public decimal? Percentage { get; set; }
    public decimal WeightagePercent { get; set; }
    public decimal? WeightedScore { get; set; }
    public bool IsAbsent { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? GradedDate { get; set; }
}

/// <summary>
/// Grades header information for Excel
/// </summary>
public class GradesHeaderInfo
{
    public string StudentName { get; set; } = string.Empty;
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public int Credits { get; set; }
    public int Semester { get; set; }
    public string FacultyName { get; set; } = string.Empty;
    public string AcademicYear { get; set; } = string.Empty;
    public DateTime GeneratedDate { get; set; }
}

#endregion

#region Attendance Export DTOs

/// <summary>
/// Attendance CSV export
/// </summary>
public class AttendanceCsvExport
{
    public string Date { get; set; } = string.Empty;
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Remarks { get; set; } = string.Empty;
}

/// <summary>
/// Attendance Excel export (with more details)
/// </summary>
public class AttendanceExcelExport
{
    public DateTime Date { get; set; }
    public string Day { get; set; } = string.Empty;
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string FacultyName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Remarks { get; set; } = string.Empty;
}

/// <summary>
/// Attendance summary per course
/// </summary>
public class AttendanceSummaryExport
{
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public int TotalClasses { get; set; }
    public int Attended { get; set; }
    public int Absent { get; set; }
    public int Late { get; set; }
    public decimal AttendancePercentage { get; set; }
    public string Status { get; set; } = string.Empty;
}

/// <summary>
/// Attendance header information for Excel
/// </summary>
public class AttendanceHeaderInfo
{
    public string StudentName { get; set; } = string.Empty;
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public int Semester { get; set; }
    public int TotalClasses { get; set; }
    public int TotalAttended { get; set; }
    public decimal OverallPercentage { get; set; }
    public DateTime GeneratedDate { get; set; }
}

#endregion

#region Student Export Filter Requests

/// <summary>
/// Filter for student transcript export
/// </summary>
public class StudentTranscriptExportRequest
{
    public int? Semester { get; set; }
    public string? AcademicYear { get; set; }
}

/// <summary>
/// Filter for student grades export
/// </summary>
public class StudentGradesExportRequest
{
    public int CourseOfferingId { get; set; }
}

/// <summary>
/// Filter for student attendance export
/// </summary>
public class StudentAttendanceExportRequest
{
    public int? CourseOfferingId { get; set; }
    public int? Semester { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
}

#endregion
