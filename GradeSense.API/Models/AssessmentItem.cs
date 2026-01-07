using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

public partial class AssessmentItem
{
    [Key]
    public int Id { get; set; }

    public int EvaluationSchemeId { get; set; }

    public int? SubjectUnitId { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string Name { get; set; } = null!;

    [Unicode(false)]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(6, 2)")]
    public decimal MaxMarks { get; set; }

    [Required]
    [StringLength(255)]
    [RegularExpression("^(Raw|Average|BestOf)$")]
    public string CalculationType { get; set; } = null!;

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Weight { get; set; }

    public DateOnly? ScheduledDate { get; set; }

    public DateOnly? DueDate { get; set; }

    public bool IsActive { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [ForeignKey("CreatedBy")]
    [InverseProperty("AssessmentItems")]
    public virtual Faculty? CreatedByNavigation { get; set; }

    [ForeignKey("EvaluationSchemeId")]
    [InverseProperty("AssessmentItems")]
    public virtual EvaluationScheme EvaluationScheme { get; set; } = null!;

    [InverseProperty("AssessmentItem")]
    public virtual ICollection<StudentMark> StudentMarks { get; set; } = new List<StudentMark>();

    [ForeignKey("SubjectUnitId")]
    [InverseProperty("AssessmentItems")]
    public virtual SubjectUnit? SubjectUnit { get; set; }

    [InverseProperty("AssessmentItem")]
    public virtual ICollection<UploadHistory> UploadHistories { get; set; } = new List<UploadHistory>();
}
