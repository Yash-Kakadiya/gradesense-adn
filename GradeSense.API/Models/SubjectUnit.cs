using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

public partial class SubjectUnit
{
    [Key]
    public int Id { get; set; }

    public int SubjectId { get; set; }

    public int UnitNumber { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string TopicName { get; set; } = null!;

    [Unicode(false)]
    public string? Description { get; set; }

    public int TeachingHours { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Weightage { get; set; }

    [Unicode(false)]
    public string? LearningOutcomes { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [InverseProperty("SubjectUnit")]
    public virtual ICollection<AssessmentItem> AssessmentItems { get; set; } = new List<AssessmentItem>();

    [ForeignKey("SubjectId")]
    [InverseProperty("SubjectUnits")]
    public virtual Subject Subject { get; set; } = null!;
}
