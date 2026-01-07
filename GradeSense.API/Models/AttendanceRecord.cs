using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

public partial class AttendanceRecord
{
    [Key]
    public int Id { get; set; }

    public int EnrollmentId { get; set; }

    public DateOnly AttendanceDate { get; set; }

    [Required]
    [StringLength(20)]
    [RegularExpression("^(Present|Absent|Excused|Late)$")]
    public string Status { get; set; } = null!;

    public int? RecordedBy { get; set; }

    [Unicode(false)]
    public string? Remarks { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [ForeignKey("EnrollmentId")]
    [InverseProperty("AttendanceRecords")]
    public virtual CourseEnrollment Enrollment { get; set; } = null!;

    [ForeignKey("RecordedBy")]
    [InverseProperty("AttendanceRecords")]
    public virtual Faculty? RecordedByNavigation { get; set; }
}
