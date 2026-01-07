using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

[Index("Code", Name = "UQ__Subjects__A25C5AA70FD74FB3", IsUnique = true)]
public partial class Subject
{
    [Key]
    public int Id { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string Code { get; set; } = null!;

    [StringLength(255)]
    [Unicode(false)]
    public string Name { get; set; } = null!;

    [Column(TypeName = "decimal(3, 1)")]
    public decimal Credit { get; set; }

    public int DepartmentId { get; set; }

    public int? Semester { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string? SubjectType { get; set; }

    public bool IsElective { get; set; }

    public int? PrerequisiteSubjectId { get; set; }

    public string? Description { get; set; }

    public string? Syllabus { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [InverseProperty("Subject")]
    public virtual ICollection<CourseOffering> CourseOfferings { get; set; } = new List<CourseOffering>();

    [ForeignKey("DepartmentId")]
    [InverseProperty("Subjects")]
    public virtual Department Department { get; set; } = null!;

    [InverseProperty("PrerequisiteSubject")]
    public virtual ICollection<Subject> InversePrerequisiteSubject { get; set; } = new List<Subject>();

    [ForeignKey("PrerequisiteSubjectId")]
    [InverseProperty("InversePrerequisiteSubject")]
    public virtual Subject? PrerequisiteSubject { get; set; }

    [InverseProperty("Subject")]
    public virtual ICollection<SubjectUnit> SubjectUnits { get; set; } = new List<SubjectUnit>();
}
