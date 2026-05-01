using System.ComponentModel.DataAnnotations;

namespace GradeSense.API.DTOs.Dashboard;

/// <summary>
/// Request model for What-If GPA Calculator
/// </summary>
public class WhatIfCalculatorRequest
{
    /// <summary>
    /// Student ID for whom to calculate
    /// </summary>
    [Required]
    public int StudentId { get; set; }

    /// <summary>
    /// Hypothetical grade entries for pending/future assessments
    /// </summary>
    public List<HypotheticalGrade> HypotheticalGrades { get; set; } = new();

    /// <summary>
    /// Hypothetical course grades for what-if semester planning
    /// </summary>
    public List<HypotheticalCourseGrade> HypotheticalCourseGrades { get; set; } = new();
}

/// <summary>
/// Hypothetical grade for individual assessment
/// </summary>
public class HypotheticalGrade
{
    /// <summary>
    /// Assessment Item ID (for existing pending assessment)
    /// </summary>
    public int? AssessmentItemId { get; set; }

    /// <summary>
    /// Enrollment ID for context
    /// </summary>
    public int EnrollmentId { get; set; }

    /// <summary>
    /// Hypothetical marks obtained
    /// </summary>
    [Range(0, 1000)]
    public decimal ObtainedMarks { get; set; }

    /// <summary>
    /// Max marks for the assessment
    /// </summary>
    [Range(0.01, 1000)]
    public decimal MaxMarks { get; set; }
}

/// <summary>
/// Hypothetical course grade for semester GPA calculation
/// </summary>
public class HypotheticalCourseGrade
{
    /// <summary>
    /// Enrollment ID (if modifying existing course)
    /// </summary>
    public int? EnrollmentId { get; set; }

    /// <summary>
    /// Course offering ID
    /// </summary>
    public int CourseOfferingId { get; set; }

    /// <summary>
    /// Hypothetical letter grade (A+, A, A-, B+, B, B-, C+, C, C-, D, F)
    /// </summary>
    [StringLength(5)]
    public string Grade { get; set; } = string.Empty;

    /// <summary>
    /// Hypothetical grade points (0-10 scale)
    /// </summary>
    [Range(0, 10)]
    public decimal GradePoints { get; set; }

    /// <summary>
    /// Course credits
    /// </summary>
    [Range(0, 20)]
    public decimal Credits { get; set; }
}

/// <summary>
/// Response model for What-If GPA Calculator
/// </summary>
public class WhatIfCalculatorResponse
{
    // Current State
    public decimal? CurrentCGPA { get; set; }
    public decimal? CurrentSemesterGPA { get; set; }
    public decimal TotalCreditsEarned { get; set; }
    public int CurrentSemester { get; set; }

    // Projected State (with hypothetical grades)
    public decimal? ProjectedCGPA { get; set; }
    public decimal? ProjectedSemesterGPA { get; set; }
    public decimal ProjectedCredits { get; set; }

    // Change Analysis
    public decimal? CGPAChange { get; set; }
    public decimal? SemesterGPAChange { get; set; }
    public string ImpactLevel { get; set; } = string.Empty; // Positive, Negative, Neutral

    // Detailed Breakdown
    public List<CourseProjection> CourseProjections { get; set; } = new();

    // What grades needed for target GPA
    public List<TargetGradeRequirement> TargetRequirements { get; set; } = new();
}

/// <summary>
/// Course projection with hypothetical grades
/// </summary>
public class CourseProjection
{
    public int EnrollmentId { get; set; }
    public int CourseOfferingId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public decimal Credits { get; set; }

    // Current State
    public decimal? CurrentPercentage { get; set; }
    public string? CurrentGrade { get; set; }
    public decimal? CurrentGradePoints { get; set; }

    // Projected State
    public decimal? ProjectedPercentage { get; set; }
    public string? ProjectedGrade { get; set; }
    public decimal? ProjectedGradePoints { get; set; }

    // Pending Assessments
    public int PendingAssessments { get; set; }
    public decimal PendingMaxMarks { get; set; }
}

/// <summary>
/// What grade is needed in remaining assessments to achieve target
/// </summary>
public class TargetGradeRequirement
{
    public int EnrollmentId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    
    /// <summary>
    /// Current percentage in course
    /// </summary>
    public decimal CurrentPercentage { get; set; }
    
    /// <summary>
    /// Minimum percentage needed in remaining assessments for target grade
    /// </summary>
    public decimal RequiredPercentageInRemaining { get; set; }
    
    /// <summary>
    /// Target grade (e.g., "A", "B+")
    /// </summary>
    public string TargetGrade { get; set; } = string.Empty;
    
    /// <summary>
    /// Whether target is achievable
    /// </summary>
    public bool IsAchievable { get; set; }
    
    /// <summary>
    /// Message explaining the requirement
    /// </summary>
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Grade point scale mapping
/// </summary>
public static class GradePointScale
{
    public static readonly Dictionary<string, decimal> Scale = new()
    {
        { "A+", 10.0m },
        { "A", 9.0m },
        { "A-", 8.5m },
        { "B+", 8.0m },
        { "B", 7.0m },
        { "B-", 6.5m },
        { "C+", 6.0m },
        { "C", 5.0m },
        { "C-", 4.5m },
        { "D", 4.0m },
        { "F", 0.0m }
    };

    public static decimal GetGradePoints(string grade)
    {
        return Scale.TryGetValue(grade.ToUpper(), out var points) ? points : 0m;
    }

    public static string GetGradeFromPercentage(decimal percentage)
    {
        return percentage switch
        {
            >= 90 => "A+",
            >= 85 => "A",
            >= 80 => "A-",
            >= 75 => "B+",
            >= 70 => "B",
            >= 65 => "B-",
            >= 60 => "C+",
            >= 55 => "C",
            >= 50 => "C-",
            >= 40 => "D",
            _ => "F"
        };
    }

    public static decimal GetGradePointsFromPercentage(decimal percentage)
    {
        var grade = GetGradeFromPercentage(percentage);
        return GetGradePoints(grade);
    }

    public static decimal GetMinPercentageForGrade(string grade)
    {
        return grade.ToUpper() switch
        {
            "A+" => 90m,
            "A" => 85m,
            "A-" => 80m,
            "B+" => 75m,
            "B" => 70m,
            "B-" => 65m,
            "C+" => 60m,
            "C" => 55m,
            "C-" => 50m,
            "D" => 40m,
            _ => 0m
        };
    }
}
