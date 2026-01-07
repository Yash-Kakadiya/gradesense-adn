using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

public partial class Batch
{
    [Key]
    public int Id { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string Name { get; set; } = null!;

    public int Semester { get; set; }

    public int AcademicYear { get; set; }

    public int DepartmentId { get; set; }

    public int? ClassCoordinatorId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string? Division { get; set; }

    public bool IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [ForeignKey("ClassCoordinatorId")]
    [InverseProperty("Batches")]
    public virtual Faculty? ClassCoordinator { get; set; }

    [InverseProperty("Batch")]
    public virtual ICollection<CourseOffering> CourseOfferings { get; set; } = new List<CourseOffering>();

    [ForeignKey("DepartmentId")]
    [InverseProperty("Batches")]
    public virtual Department Department { get; set; } = null!;
}
