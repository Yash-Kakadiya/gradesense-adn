using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

public partial class EvaluationScheme
{
    [Key]
    public int Id { get; set; }

    public int CourseOfferingId { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string Name { get; set; } = null!;

    [Unicode(false)]
    public string? Description { get; set; }

    [Column(TypeName = "decimal(6, 2)")]
    public decimal TotalMarks { get; set; }

    [Column(TypeName = "decimal(6, 2)")]
    public decimal PassingMarks { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal Weight { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string? EvaluationType { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [InverseProperty("EvaluationScheme")]
    public virtual ICollection<AssessmentItem> AssessmentItems { get; set; } = new List<AssessmentItem>();

    [ForeignKey("CourseOfferingId")]
    [InverseProperty("EvaluationSchemes")]
    public virtual CourseOffering CourseOffering { get; set; } = null!;
}
