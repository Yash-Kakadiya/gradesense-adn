using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Models;

[Table("AuditLog")]
public partial class AuditLog
{
    [Key]
    public long Id { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string Action { get; set; } = null!;

    public int ActorUserId { get; set; }

    [StringLength(100)]
    [Unicode(false)]
    public string EntityName { get; set; } = null!;

    [StringLength(100)]
    [Unicode(false)]
    public string EntityId { get; set; } = null!;

    [Unicode(false)]
    public string? OldValue { get; set; }

    [Unicode(false)]
    public string? NewValue { get; set; }

    [Unicode(false)]
    public string? ChangedFields { get; set; }

    public DateTime? OccurredAt { get; set; }

    [Column("IPAddress")]
    [StringLength(45)]
    [Unicode(false)]
    public string? Ipaddress { get; set; }

    [StringLength(500)]
    [Unicode(false)]
    public string? UserAgent { get; set; }

    [StringLength(255)]
    [Unicode(false)]
    public string? SessionId { get; set; }

    [Unicode(false)]
    public string? Reason { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? DeletedAt { get; set; }

    [ForeignKey("ActorUserId")]
    [InverseProperty("AuditLogs")]
    public virtual User ActorUser { get; set; } = null!;
}
