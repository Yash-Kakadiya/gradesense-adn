namespace GradeSense.API.DTOs.Dashboard;

/// <summary>
/// Student Dashboard Response - Personal academic overview
/// </summary>
public class StudentDashboardResponse
{
    // Student Info
    public int StudentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public int CurrentSemester { get; set; }
    public decimal? CGPA { get; set; }
    public string Status { get; set; } = string.Empty;

    // Course Stats
    public int TotalEnrolledCourses { get; set; }
    public int ActiveCourses { get; set; }
    public int CompletedCourses { get; set; }
    public int DroppedCourses { get; set; }

    // Grade Summary
    public decimal? CurrentSemesterGPA { get; set; }
    public decimal TotalCreditsEarned { get; set; }
    public decimal TotalCreditsAttempted { get; set; }

    // Attendance Summary
    public decimal OverallAttendancePercentage { get; set; }
    public int TotalClassesAttended { get; set; }
    public int TotalClassesMissed { get; set; }

    // Current Courses
    public List<StudentCourseItem> CurrentCourses { get; set; } = new();

    // Recent Grades
    public List<RecentGradeItem> RecentGrades { get; set; } = new();

    // Upcoming Assessments (if any pending)
    public List<UpcomingAssessmentItem> UpcomingAssessments { get; set; } = new();

    // Performance Trend
    public List<SemesterPerformance> PerformanceTrend { get; set; } = new();

    // Predictions/Alerts
    public string? RiskStatus { get; set; }
    public decimal? RiskScore { get; set; }
    public List<string> Recommendations { get; set; } = new();
}

/// <summary>
/// Student's enrolled course item
/// </summary>
public class StudentCourseItem
{
    public int EnrollmentId { get; set; }
    public int CourseOfferingId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public decimal Credits { get; set; }
    public string FacultyName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal? CurrentScore { get; set; }
    public string? CurrentGrade { get; set; }
    public decimal AttendancePercentage { get; set; }
}

/// <summary>
/// Recent grade item
/// </summary>
public class RecentGradeItem
{
    public string SubjectName { get; set; } = string.Empty;
    public string AssessmentName { get; set; } = string.Empty;
    public decimal MaxMarks { get; set; }
    public decimal? ObtainedMarks { get; set; }
    public decimal? Percentage { get; set; }
    public DateTime? GradedDate { get; set; }
}

/// <summary>
/// Upcoming assessment item
/// </summary>
public class UpcomingAssessmentItem
{
    public string SubjectName { get; set; } = string.Empty;
    public string AssessmentName { get; set; } = string.Empty;
    public decimal MaxMarks { get; set; }
    public decimal Weightage { get; set; }
    public DateOnly? DueDate { get; set; }
}

/// <summary>
/// Semester-wise performance
/// </summary>
public class SemesterPerformance
{
    public int Semester { get; set; }
    public decimal? GPA { get; set; }
    public int CreditsEarned { get; set; }
    public decimal AttendancePercentage { get; set; }
}
