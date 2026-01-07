using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

[Index("CourseOfferingId", "RollNumber", Name = "UQ__CourseEn__C101C94234A927E2", IsUnique = true)]
public partial class CourseEnrollment
{
    [Key]
    public int Id { get; set; }

    public int CourseOfferingId { get; set; }

    public int StudentId { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string? RollNumber { get; set; }

    public DateTime? EnrollmentDate { get; set; }

    [Required]
    [StringLength(50)]
    [RegularExpression("^(Active|Completed|Dropped|Withdrawn)$")]
    public string Status { get; set; } = null!;

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? AttendancePercentage { get; set; }

    [StringLength(5)]
    [Unicode(false)]
    public string? Grade { get; set; }

    [Range(0, 10)]
    [Column(TypeName = "decimal(4, 2)")]
    public decimal? GradePoints { get; set; }
    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [InverseProperty("Enrollment")]
    public virtual ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();

    [ForeignKey("CourseOfferingId")]
    [InverseProperty("CourseEnrollments")]
    public virtual CourseOffering CourseOffering { get; set; } = null!;

    [InverseProperty("CourseEnrollment")]
    public virtual ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();

    [ForeignKey("StudentId")]
    [InverseProperty("CourseEnrollments")]
    public virtual Student Student { get; set; } = null!;

    [InverseProperty("Enrollment")]
    public virtual ICollection<StudentMark> StudentMarks { get; set; } = new List<StudentMark>();
}
