using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

public partial class StudentMark
{
    [Key]
    public int Id { get; set; }

    public int EnrollmentId { get; set; }

    public int AssessmentItemId { get; set; }

    [Column(TypeName = "decimal(6, 2)")]
    public decimal? ObtainedMarks { get; set; }

    public bool IsAbsent { get; set; }

    [Unicode(false)]
    public string? Remarks { get; set; }

    public int GraderId { get; set; }

    public DateTime? GradedDate { get; set; }

    public DateTime? SubmissionDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [ForeignKey("AssessmentItemId")]
    [InverseProperty("StudentMarks")]
    public virtual AssessmentItem AssessmentItem { get; set; } = null!;

    [ForeignKey("EnrollmentId")]
    [InverseProperty("StudentMarks")]
    public virtual CourseEnrollment Enrollment { get; set; } = null!;

    [ForeignKey("GraderId")]
    [InverseProperty("StudentMarks")]
    public virtual Faculty Grader { get; set; } = null!;
}
