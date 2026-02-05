namespace GradeSense.API.DTOs.Dashboard;

/// <summary>
/// Admin Dashboard Response - Overview statistics for administrators
/// </summary>
public class AdminDashboardResponse
{
    // Counts
    public int TotalUsers { get; set; }
    public int TotalStudents { get; set; }
    public int TotalFaculties { get; set; }
    public int TotalDepartments { get; set; }
    public int TotalSubjects { get; set; }
    public int TotalBatches { get; set; }
    public int TotalCourseOfferings { get; set; }
    public int ActiveCourseOfferings { get; set; }
    public int TotalEvaluationSchemes { get; set; }
    public int TotalAuditLogs { get; set; }

    // Active/Inactive counts for entities
    public int ActiveDepartments { get; set; }
    public int InactiveDepartments { get; set; }
    public int ActiveBatches { get; set; }
    public int InactiveBatches { get; set; }
    public int ActiveSubjects { get; set; }
    public int InactiveSubjects { get; set; }
    public int ElectiveSubjects { get; set; }
    public int ActiveEvaluationSchemes { get; set; }
    public int InactiveEvaluationSchemes { get; set; }
    public int InactiveCourseOfferings { get; set; }
    public int ActiveFaculties { get; set; }
    public int InactiveFaculties { get; set; }

    // Audit log action counts
    public int AuditLogCreates { get; set; }
    public int AuditLogUpdates { get; set; }
    public int AuditLogDeletes { get; set; }
    public int AuditLogLogins { get; set; }

    // Coordinator counts (faculties who are coordinators)
    public int TotalCoordinators { get; set; }

    // User Stats
    public int ActiveUsers { get; set; }
    public int InactiveUsers { get; set; }
    public int NewUsersThisMonth { get; set; }

    // User counts by Role (for pie chart)
    public int StudentUsers { get; set; }
    public int FacultyUsers { get; set; }
    public int AdminUsers { get; set; }

    // Student Stats
    public int ActiveStudents { get; set; }
    public int GraduatedStudents { get; set; }
    public int AtRiskStudents { get; set; }

    // Enrollment Stats
    public int TotalEnrollments { get; set; }
    public int ActiveEnrollments { get; set; }
    public int CompletedEnrollments { get; set; }

    // Recent Activity
    public List<RecentActivityItem> RecentActivities { get; set; } = new();

    // Department Overview
    public List<DepartmentOverview> DepartmentStats { get; set; } = new();

    // Enrollment Trends (Last 6 months)
    public List<MonthlyStatItem> EnrollmentTrends { get; set; } = new();
}

/// <summary>
/// Recent activity item for dashboard
/// </summary>
public class RecentActivityItem
{
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string PerformedBy { get; set; } = string.Empty;
    public DateTime OccurredAt { get; set; }
}

/// <summary>
/// Department statistics overview
/// </summary>
public class DepartmentOverview
{
    public int DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string DepartmentCode { get; set; } = string.Empty;
    public int StudentCount { get; set; }
    public int FacultyCount { get; set; }
    public int SubjectCount { get; set; }
    public int ActiveCourses { get; set; }
}

/// <summary>
/// Monthly statistics for trends
/// </summary>
public class MonthlyStatItem
{
    public string Month { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Count { get; set; }
}
