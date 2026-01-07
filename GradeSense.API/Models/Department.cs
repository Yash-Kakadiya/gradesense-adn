using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

[Index("Name", Name = "UQ__Departme__737584F6CB232671", IsUnique = true)]
[Index("Code", Name = "UQ__Departme__A25C5AA7288A8A0F", IsUnique = true)]
public partial class Department
{
    [Key]
    public int Id { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string Name { get; set; } = null!;

    [StringLength(50)]
    [Unicode(false)]
    public string? Code { get; set; }

    [Column("HODUserId")]
    public int? HoduserId { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [InverseProperty("Department")]
    public virtual ICollection<Batch> Batches { get; set; } = new List<Batch>();

    [InverseProperty("Department")]
    public virtual ICollection<Faculty> Faculties { get; set; } = new List<Faculty>();

    [ForeignKey("HoduserId")]
    [InverseProperty("Departments")]
    public virtual User? Hoduser { get; set; }

    [InverseProperty("Department")]
    public virtual ICollection<Student> Students { get; set; } = new List<Student>();

    [InverseProperty("Department")]
    public virtual ICollection<Subject> Subjects { get; set; } = new List<Subject>();
}
