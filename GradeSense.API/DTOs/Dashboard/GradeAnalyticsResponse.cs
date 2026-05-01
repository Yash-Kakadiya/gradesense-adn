namespace GradeSense.API.DTOs.Dashboard;

/// <summary>
/// Grade Analytics Response - Comprehensive grade analysis for a student
/// </summary>
public class GradeAnalyticsResponse
{
    // Student Info
    public int StudentId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string EnrollmentNumber { get; set; } = string.Empty;
    public int CurrentSemester { get; set; }

    // GPA Overview
    public decimal? CGPA { get; set; }
    public decimal? CurrentSemesterGPA { get; set; }
    public decimal TotalCreditsEarned { get; set; }
    public decimal TotalCreditsAttempted { get; set; }

    // Grade Distribution (for pie/donut chart)
    public List<GradeDistributionItem> GradeDistribution { get; set; } = new();

    // Course Performance Details (for detailed table/cards)
    public List<CourseGradeDetail> CourseGrades { get; set; } = new();

    // Assessment Type Performance (for bar chart - by type like Quiz, Assignment, Exam)
    public List<AssessmentTypePerformance> AssessmentTypePerformances { get; set; } = new();

    // Semester Comparison (for trend chart)
    public List<SemesterGPAItem> SemesterGPAs { get; set; } = new();

    // Credit Progress
    public int TotalRequiredCredits { get; set; }
    public int EarnedCredits { get; set; }
    public decimal CreditCompletionPercentage { get; set; }
}

/// <summary>
/// Grade distribution item for pie chart (A, B, C, D, F counts)
/// </summary>
public class GradeDistributionItem
{
    public string Grade { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
    public string Color { get; set; } = string.Empty;
}

/// <summary>
/// Course-wise grade details
/// </summary>
public class CourseGradeDetail
{
    public int EnrollmentId { get; set; }
    public int CourseOfferingId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public int Semester { get; set; }
    public decimal Credits { get; set; }
    public string Status { get; set; } = string.Empty;
    
    // Score breakdown
    public decimal TotalObtained { get; set; }
    public decimal TotalMaxMarks { get; set; }
    public decimal Percentage { get; set; }
    
    // Grade info
    public string? Grade { get; set; }
    public decimal? GradePoints { get; set; }
    
    // Assessment details
    public int TotalAssessments { get; set; }
    public int CompletedAssessments { get; set; }
    public int PendingAssessments { get; set; }
    
    // Assessment breakdown
    public List<AssessmentBreakdown> Assessments { get; set; } = new();
}

/// <summary>
/// Individual assessment breakdown within a course
/// </summary>
public class AssessmentBreakdown
{
    public int AssessmentItemId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal MaxMarks { get; set; }
    public decimal? ObtainedMarks { get; set; }
    public decimal? Percentage { get; set; }
    public decimal? Weight { get; set; }
    public bool IsGraded { get; set; }
    public bool IsAbsent { get; set; }
    public DateTime? GradedDate { get; set; }
}

/// <summary>
/// Performance by assessment type (Quiz, Assignment, Exam, etc.)
/// </summary>
public class AssessmentTypePerformance
{
    public string Type { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal TotalMaxMarks { get; set; }
    public decimal TotalObtained { get; set; }
    public decimal AveragePercentage { get; set; }
}

/// <summary>
/// Semester-wise GPA for trend chart
/// </summary>
public class SemesterGPAItem
{
    public int Semester { get; set; }
    public string SemesterLabel { get; set; } = string.Empty;
    public decimal? GPA { get; set; }
    public int Credits { get; set; }
    public int CoursesCount { get; set; }
}
