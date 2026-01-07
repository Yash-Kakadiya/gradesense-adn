using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

[Index("EmployeeId", Name = "UQ__Facultie__7AD04F107CF23582", IsUnique = true)]
public partial class Faculty
{
    [Key]
    public int Id { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string EmployeeId { get; set; } = null!;

    public int DepartmentId { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string? Designation { get; set; }

    public DateOnly? JoiningDate { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string? Qualification { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string? Specialization { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [InverseProperty("CreatedByNavigation")]
    public virtual ICollection<AssessmentItem> AssessmentItems { get; set; } = new List<AssessmentItem>();

    [InverseProperty("RecordedByNavigation")]
    public virtual ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();

    [InverseProperty("ClassCoordinator")]
    public virtual ICollection<Batch> Batches { get; set; } = new List<Batch>();

    [InverseProperty("SubjectCoordinator")]
    public virtual ICollection<CourseOffering> CourseOfferings { get; set; } = new List<CourseOffering>();

    [ForeignKey("DepartmentId")]
    [InverseProperty("Faculties")]
    public virtual Department Department { get; set; } = null!;

    [InverseProperty("Faculty")]
    public virtual ICollection<FacultyAssignment> FacultyAssignments { get; set; } = new List<FacultyAssignment>();

    [ForeignKey("Id")]
    [InverseProperty("Faculty")]
    public virtual User IdNavigation { get; set; } = null!;

    [InverseProperty("ReviewedByNavigation")]
    public virtual ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();

    [InverseProperty("Grader")]
    public virtual ICollection<StudentMark> StudentMarks { get; set; } = new List<StudentMark>();

    [InverseProperty("UploadedByNavigation")]
    public virtual ICollection<UploadHistory> UploadHistories { get; set; } = new List<UploadHistory>();

    //public static implicit operator Faculty(Faculty v)
    //{
    //    throw new NotImplementedException();
    //}
}
