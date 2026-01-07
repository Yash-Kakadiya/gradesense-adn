using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

[Index("Email", Name = "idx_users_email", IsUnique = true)]
[Index("Role", Name = "idx_users_role")]
[Index("IsActive", Name = "idx_users_active")]
public partial class User
{
    [Key]
    public int Id { get; set; }

    [Required(ErrorMessage = "Email is required")]
    [StringLength(255)]
    [Unicode(false)]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = null!;

    [Required(ErrorMessage = "Password hash is required")]
    [StringLength(255)]
    [Unicode(false)]
    public string PasswordHash { get; set; } = null!;

    [Required(ErrorMessage = "Full name is required")]
    [StringLength(255, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 255 characters")]
    [Unicode(false)]
    public string FullName { get; set; } = null!;

    [Required(ErrorMessage = "Role is required")]
    [StringLength(255)]
    [RegularExpression("^(Student|Faculty|Admin)$", ErrorMessage = "Role must be Student, Faculty, or Admin")]
    public string Role { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [InverseProperty("ActorUser")]
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    [InverseProperty("Hoduser")]
    public virtual ICollection<Department> Departments { get; set; } = new List<Department>();

    [InverseProperty("IdNavigation")]
    public virtual Faculty? Faculty { get; set; }

    [InverseProperty("IdNavigation")]
    public virtual Student? Student { get; set; }
}