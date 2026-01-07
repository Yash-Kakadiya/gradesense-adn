using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

[Table("UploadHistory")]
public partial class UploadHistory
{
    [Key]
    [StringLength(36)]
    [Unicode(false)]
    public string Id { get; set; } = null!;

    public int CourseOfferingId { get; set; }

    public int? AssessmentItemId { get; set; }

    public int UploadedBy { get; set; }

    [StringLength(500)]
    [Unicode(false)]
    public string FileName { get; set; } = null!;

    public long? FileSize { get; set; }

    public int SuccessCount { get; set; }

    public int ErrorCount { get; set; }

    public int TotalCount { get; set; }

    [Unicode(false)]
    public string? ErrorDetails { get; set; }

    [Unicode(false)]
    public string? RowDataBlob { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string Status { get; set; } = null!;

    public DateTime? UploadedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [ForeignKey("AssessmentItemId")]
    [InverseProperty("UploadHistories")]
    public virtual AssessmentItem? AssessmentItem { get; set; }

    [ForeignKey("CourseOfferingId")]
    [InverseProperty("UploadHistories")]
    public virtual CourseOffering CourseOffering { get; set; } = null!;

    [ForeignKey("UploadedBy")]
    [InverseProperty("UploadHistories")]
    public virtual Faculty UploadedByNavigation { get; set; } = null!;
}
