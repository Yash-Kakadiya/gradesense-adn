using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

public partial class CourseOffering
{
    [Key]
    public int Id { get; set; }

    public int SubjectId { get; set; }

    public int BatchId { get; set; }

    public int SubjectCoordinatorId { get; set; }

    public int AcademicYear { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public int? MaxEnrollment { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [ForeignKey("BatchId")]
    [InverseProperty("CourseOfferings")]
    public virtual Batch Batch { get; set; } = null!;

    [InverseProperty("CourseOffering")]
    public virtual ICollection<CourseEnrollment> CourseEnrollments { get; set; } = new List<CourseEnrollment>();

    [InverseProperty("CourseOffering")]
    public virtual ICollection<EvaluationScheme> EvaluationSchemes { get; set; } = new List<EvaluationScheme>();

    [InverseProperty("CourseOffering")]
    public virtual ICollection<FacultyAssignment> FacultyAssignments { get; set; } = new List<FacultyAssignment>();

    [ForeignKey("SubjectId")]
    [InverseProperty("CourseOfferings")]
    public virtual Subject Subject { get; set; } = null!;

    [ForeignKey("SubjectCoordinatorId")]
    [InverseProperty("CourseOfferings")]
    public virtual Faculty SubjectCoordinator { get; set; } = null!;

    [InverseProperty("CourseOffering")]
    public virtual ICollection<UploadHistory> UploadHistories { get; set; } = new List<UploadHistory>();
}
