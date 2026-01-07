using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

[Index("EnrollmentNumber", Name = "idx_students_enrollment", IsUnique = true)]
[Index("DepartmentId", Name = "idx_students_department")]
[Index("AdmissionYear", "CurrentSemester", Name = "idx_students_year_sem")]
public partial class Student
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(255)]
    [Unicode(false)]
    public string EnrollmentNumber { get; set; } = null!;

    [Required]
    [Range(2000, 2100, ErrorMessage = "Admission year must be between 2000 and 2100")]
    public int AdmissionYear { get; set; }

    [Required]
    [Range(1, 8, ErrorMessage = "Semester must be between 1 and 8")]
    public int CurrentSemester { get; set; }

    [Required]
    public int DepartmentId { get; set; }

    [Required]
    [StringLength(50)]
    [Unicode(false)]
    [RegularExpression("^(Active|Suspended|Graduated|Dropped)$",
        ErrorMessage = "Status must be Active, Suspended, Graduated, or Dropped")]
    public string Status { get; set; } = null!;

    [Range(0, 10, ErrorMessage = "CGPA must be between 0 and 10")]
    [Column(TypeName = "decimal(4, 2)")]
    public decimal? Cgpa { get; set; }

    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }

    [ForeignKey("DepartmentId")]
    [InverseProperty("Students")]
    public virtual Department Department { get; set; } = null!;

    [ForeignKey("Id")]
    [InverseProperty("Student")]
    public virtual User IdNavigation { get; set; } = null!;

    [InverseProperty("Student")]
    public virtual ICollection<CourseEnrollment> CourseEnrollments { get; set; } = new List<CourseEnrollment>();
}