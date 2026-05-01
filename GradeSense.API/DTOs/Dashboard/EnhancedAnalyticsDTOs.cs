using System.ComponentModel.DataAnnotations;

namespace GradeSense.API.DTOs.Dashboard;

public class EnhancedAnalyticsRequest
{
    public int? SubjectId { get; set; }
    public int? BatchId { get; set; }
    public int? CourseOfferingId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }

    /// <summary>
    /// Optional faculty scope. If caller is Faculty, service will enforce this automatically.
    /// </summary>
    public int? FacultyId { get; set; }

    /// <summary>
    /// Optional minimum count filter to drop tiny cohorts from comparative charts (default 3).
    /// </summary>
    [Range(0, int.MaxValue)]
    public int MinStudents { get; set; } = 3;
}

public class EnhancedAnalyticsResponse
{
    public List<CrossBatchPerformanceItem> CrossBatchPerformance { get; set; } = new();
    public List<GradeTrendPoint> GradeTrends { get; set; } = new();
    public List<GradeDistributionSeries> GradeDistributions { get; set; } = new();
}

public class CrossBatchPerformanceItem
{
    public int? BatchId { get; set; }
    public string BatchName { get; set; } = string.Empty;
    public int? CourseOfferingId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public decimal AveragePercentage { get; set; }
    public decimal MedianPercentage { get; set; }
    public int StudentCount { get; set; }
    public int AssessmentCount { get; set; }
}

public class GradeTrendPoint
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string Label { get; set; } = string.Empty; // e.g., "2025-01"
    public decimal AveragePercentage { get; set; }
    public int SampleSize { get; set; }
}

public class GradeDistributionSeries
{
    public string Label { get; set; } = string.Empty; // batch / course label
    public int? BatchId { get; set; }
    public int? CourseOfferingId { get; set; }
    public List<GradeBucket> Buckets { get; set; } = new();
}

public class GradeBucket
{
    public string Grade { get; set; } = string.Empty; // A, B, C, D, F
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}
