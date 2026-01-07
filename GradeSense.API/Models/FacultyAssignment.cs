using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

public partial class FacultyAssignment
{
    [Key]
    public int Id { get; set; }

    public int CourseOfferingId { get; set; }

    public int FacultyId { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string? Role { get; set; }

    public DateTime? AssignmentDate { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [ForeignKey("CourseOfferingId")]
    [InverseProperty("FacultyAssignments")]
    public virtual CourseOffering CourseOffering { get; set; } = null!;

    [ForeignKey("FacultyId")]
    [InverseProperty("FacultyAssignments")]
    public virtual Faculty Faculty { get; set; } = null!;
}
