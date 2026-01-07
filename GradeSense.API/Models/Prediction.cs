using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

public partial class Prediction
{
    [Key]
    [StringLength(36)]
    [Unicode(false)]
    public string Id { get; set; } = null!;

    public int CourseEnrollmentId { get; set; }

    [Required]
    [StringLength(50)]
    [RegularExpression("^(At-Risk|Safe|High-Achiever|Needs-Attention)$")]
    public string PredictedCategory { get; set; } = null!;

    [Required]
    [Range(0, 1)]
    [Column(TypeName = "decimal(5, 4)")]
    public decimal RiskScore { get; set; }

    [Range(0, 1)]
    [Column(TypeName = "decimal(5, 4)")]
    public decimal? ConfidenceScore { get; set; }

    [StringLength(5)]
    [Unicode(false)]
    public string? PredictedGrade { get; set; }

    [Column(TypeName = "decimal(6, 2)")]
    public decimal? PredictedMarks { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string ModelVersion { get; set; } = null!;

    [Column(TypeName = "decimal(5, 4)")]
    public decimal? ModelAccuracy { get; set; }

    [Unicode(false)]
    public string? FeatureImportance { get; set; }

    [Unicode(false)]
    public string? ExplanationJson { get; set; }

    [Unicode(false)]
    public string? RecommendedActions { get; set; }

    public DateTime? GeneratedAt { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public bool IsActive { get; set; }

    public int? ReviewedBy { get; set; }

    public DateTime? ReviewedAt { get; set; }

    [Unicode(false)]
    public string? ReviewNotes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [ForeignKey("CourseEnrollmentId")]
    [InverseProperty("Predictions")]
    public virtual CourseEnrollment CourseEnrollment { get; set; } = null!;

    [ForeignKey("ReviewedBy")]
    [InverseProperty("Predictions")]
    public virtual Faculty? ReviewedByNavigation { get; set; }
}
