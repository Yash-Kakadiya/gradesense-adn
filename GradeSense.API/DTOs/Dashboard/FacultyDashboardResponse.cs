namespace GradeSense.API.DTOs.Dashboard;

/// <summary>
/// Faculty Dashboard Response - Teaching overview
/// </summary>
public class FacultyDashboardResponse
{
    // Faculty Info
    public int FacultyId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
    public string? Designation { get; set; }

    // Teaching Stats
    public int TotalCoursesTeaching { get; set; }
    public int ActiveCourses { get; set; }
    public int TotalStudentsEnrolled { get; set; }

    // Grading Stats
    public int TotalAssessmentsCreated { get; set; }
    public int PendingGrades { get; set; }
    public int GradedAssessments { get; set; }

    // Current Courses
    public List<FacultyCourseItem> CurrentCourses { get; set; } = new();

    // Pending Work
    public List<PendingGradeItem> PendingGradeItems { get; set; } = new();

    // Recent Activity
    public List<FacultyActivityItem> RecentActivities { get; set; } = new();

    // Student Performance Overview (across all courses)
    public PerformanceDistribution StudentPerformance { get; set; } = new();

    // At-Risk Students
    public List<AtRiskStudentItem> AtRiskStudents { get; set; } = new();
}

/// <summary>
/// Faculty's course teaching item
/// </summary>
public class FacultyCourseItem
{
    public int CourseOfferingId { get; set; }
    public int SubjectId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string BatchName { get; set; } = string.Empty;
    public int Semester { get; set; }
    public int AcademicYear { get; set; }
    public int EnrolledStudents { get; set; }
    public int PendingGrades { get; set; }
    public decimal AverageScore { get; set; }
    public decimal AverageAttendance { get; set; }
    public bool IsCoordinator { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

/// <summary>
/// Pending grade item for faculty
/// </summary>
public class PendingGradeItem
{
    public int AssessmentItemId { get; set; }
    public string AssessmentName { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string BatchName { get; set; } = string.Empty;
    public int TotalStudents { get; set; }
    public int GradedCount { get; set; }
    public int PendingCount { get; set; }
    public DateTime? DueDate { get; set; }
}

/// <summary>
/// Faculty activity item
/// </summary>
public class FacultyActivityItem
{
    public string Action { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; }
}

/// <summary>
/// Performance distribution across grades
/// </summary>
public class PerformanceDistribution
{
    public int ExcellentCount { get; set; }    // 90-100%
    public int GoodCount { get; set; }         // 70-89%
    public int AverageCount { get; set; }      // 50-69%
    public int BelowAverageCount { get; set; } // 40-49%
    public int FailingCount { get; set; }      // Below 40%
}

/// <summary>
/// At-risk student item
/// </summary>
public class AtRiskStudentItem
{
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string EnrollmentNumber { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public decimal? CurrentScore { get; set; }
    public decimal AttendancePercentage { get; set; }
    public string RiskReason { get; set; } = string.Empty;
}
