using System;
using System.Collections.Generic;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Data;

public partial class GradeSenseDbContext : DbContext
{
    public GradeSenseDbContext()
    {
    }

    public GradeSenseDbContext(DbContextOptions<GradeSenseDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AssessmentItem> AssessmentItems { get; set; }
    public virtual DbSet<AttendanceRecord> AttendanceRecords { get; set; }
    public virtual DbSet<AuditLog> AuditLogs { get; set; }
    public virtual DbSet<Batch> Batches { get; set; }
    public virtual DbSet<CourseEnrollment> CourseEnrollments { get; set; }
    public virtual DbSet<CourseOffering> CourseOfferings { get; set; }
    public virtual DbSet<Department> Departments { get; set; }
    public virtual DbSet<EvaluationScheme> EvaluationSchemes { get; set; }
    public virtual DbSet<Faculty> Faculties { get; set; }
    public virtual DbSet<FacultyAssignment> FacultyAssignments { get; set; }
    public virtual DbSet<Prediction> Predictions { get; set; }
    public virtual DbSet<Student> Students { get; set; }
    public virtual DbSet<StudentMark> StudentMarks { get; set; }
    public virtual DbSet<Subject> Subjects { get; set; }
    public virtual DbSet<SubjectUnit> SubjectUnits { get; set; }
    public virtual DbSet<UploadHistory> UploadHistories { get; set; }
    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ==================== USERS ====================
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            // Unique indexes for emails and phone (handled via model attributes, but ensure filter for nulls)
            entity.HasIndex(e => e.InstitutionalEmail)
                .HasFilter("[InstitutionalEmail] IS NOT NULL")
                .IsUnique();
            entity.HasIndex(e => e.PhoneNumber)
                .HasFilter("[PhoneNumber] IS NOT NULL")
                .IsUnique();

            // Check constraint for Role
            entity.HasCheckConstraint("CK_Users_Role", "[Role] IN ('Student', 'Faculty', 'Admin')");
        });

        // ==================== DEPARTMENTS ====================
        modelBuilder.Entity<Department>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Hoduser)
                .WithMany(p => p.Departments)
                .HasConstraintName("FK__Departmen__HODUs__1EA48E88");
        });

        // ==================== FACULTIES ====================
        modelBuilder.Entity<Faculty>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Department)
                .WithMany(p => p.Faculties)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Faculties__Depar__208CD6FA");

            entity.HasOne(d => d.IdNavigation)
                .WithOne(p => p.Faculty)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Faculties__Id__1F98B2C1");
        });

        // ==================== STUDENTS ====================
        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Active");

            // Check constraints
            entity.HasCheckConstraint("CK_Students_Status", "[Status] IN ('Active', 'Suspended', 'Graduated', 'Dropped')");
            entity.HasCheckConstraint("CK_Students_CGPA", "[CGPA] BETWEEN 0 AND 10");

            entity.HasOne(d => d.Department)
                .WithMany(p => p.Students)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Students__Depart__22751F6C");

            entity.HasOne(d => d.IdNavigation)
                .WithOne(p => p.Student)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Students__Id__2180FB33");
        });

        // ==================== BATCHES ====================
        modelBuilder.Entity<Batch>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.ClassCoordinator)
                .WithMany(p => p.Batches)
                .HasConstraintName("FK__Batches__ClassCo__245D67DE");

            entity.HasOne(d => d.Department)
                .WithMany(p => p.Batches)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Batches__Departm__236943A5");
        });

        // ==================== SUBJECTS ====================
        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Department)
                .WithMany(p => p.Subjects)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Subjects__Depart__25518C17");

            entity.HasOne(d => d.PrerequisiteSubject)
                .WithMany(p => p.InversePrerequisiteSubject)
                .HasConstraintName("FK__Subjects__Prereq__2645B050");
        });

        // ==================== SUBJECT UNITS ====================
        modelBuilder.Entity<SubjectUnit>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.Subject)
                .WithMany(p => p.SubjectUnits)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SubjectUn__Subje__2739D489");
        });

        // ==================== COURSE OFFERINGS ====================
        modelBuilder.Entity<CourseOffering>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Batch)
                .WithMany(p => p.CourseOfferings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CourseOff__Batch__29221CFB");

            entity.HasOne(d => d.SubjectCoordinator)
                .WithMany(p => p.CourseOfferings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CourseOff__Subje__2A164134");

            entity.HasOne(d => d.Subject)
                .WithMany(p => p.CourseOfferings)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CourseOff__Subje__282DF8C2");
        });

        // ==================== COURSE ENROLLMENTS ====================
        modelBuilder.Entity<CourseEnrollment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.EnrollmentDate).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Active");

            // Check constraints
            entity.HasCheckConstraint("CK_CourseEnrollments_Status", "[Status] IN ('Active', 'Completed', 'Dropped', 'Withdrawn')");
            entity.HasCheckConstraint("CK_CourseEnrollments_GradePoints", "[GradePoints] IS NULL OR [GradePoints] BETWEEN 0 AND 10");

            entity.HasOne(d => d.CourseOffering)
                .WithMany(p => p.CourseEnrollments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CourseEnr__Cours__2B0A656D");

            entity.HasOne(d => d.Student)
                .WithMany(p => p.CourseEnrollments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CourseEnr__Stude__2BFE89A6");
        });

        // ==================== EVALUATION SCHEMES ====================
        modelBuilder.Entity<EvaluationScheme>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.CourseOffering)
                .WithMany(p => p.EvaluationSchemes)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Evaluatio__Cours__2CF2ADDF");
        });

        // ==================== ASSESSMENT ITEMS ====================
        modelBuilder.Entity<AssessmentItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CalculationType).HasDefaultValue("Raw");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            // Check constraint
            entity.HasCheckConstraint("CK_AssessmentItems_CalculationType", "[CalculationType] IN ('Raw', 'Average', 'BestOf')");

            entity.HasOne(d => d.CreatedByNavigation)
                .WithMany(p => p.AssessmentItems)
                .HasConstraintName("FK__Assessmen__Creat__2FCF1A8A");

            entity.HasOne(d => d.EvaluationScheme)
                .WithMany(p => p.AssessmentItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Assessmen__Evalu__2DE6D218");

            entity.HasOne(d => d.SubjectUnit)
                .WithMany(p => p.AssessmentItems)
                .HasConstraintName("FK__Assessmen__Subje__2EDAF651");
        });

        // ==================== STUDENT MARKS ====================
        modelBuilder.Entity<StudentMark>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsAbsent).HasDefaultValue(false);

            // Check constraint for ObtainedMarks
            entity.HasCheckConstraint("CK_StudentMarks_ObtainedMarks", "[ObtainedMarks] IS NULL OR [IsAbsent] = 0");

            entity.HasOne(d => d.AssessmentItem)
                .WithMany(p => p.StudentMarks)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StudentMa__Asses__31B762FC");

            entity.HasOne(d => d.Enrollment)
                .WithMany(p => p.StudentMarks)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StudentMa__Enrol__30C33EC3");

            entity.HasOne(d => d.Grader)
                .WithMany(p => p.StudentMarks)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StudentMa__Grade__32AB8735");
        });

        // ==================== FACULTY ASSIGNMENTS ====================
        modelBuilder.Entity<FacultyAssignment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AssignmentDate).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.CourseOffering)
                .WithMany(p => p.FacultyAssignments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__FacultyAs__Cours__339FAB6E");

            entity.HasOne(d => d.Faculty)
                .WithMany(p => p.FacultyAssignments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__FacultyAs__Facul__3493CFA7");
        });

        // ==================== ATTENDANCE RECORDS ====================
        modelBuilder.Entity<AttendanceRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");

            // Check constraint
            entity.HasCheckConstraint("CK_AttendanceRecords_Status", "[Status] IN ('Present', 'Absent', 'Excused', 'Late')");

            entity.HasOne(d => d.Enrollment)
                .WithMany(p => p.AttendanceRecords)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Attendanc__Enrol__3587F3E0");

            entity.HasOne(d => d.RecordedByNavigation)
                .WithMany(p => p.AttendanceRecords)
                .HasConstraintName("FK__Attendanc__Recor__367C1819");
        });

        // ==================== UPLOAD HISTORY ====================
        modelBuilder.Entity<UploadHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Processing");
            entity.Property(e => e.UploadedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.SuccessCount).HasDefaultValue(0);
            entity.Property(e => e.ErrorCount).HasDefaultValue(0);

            // Check constraint
            entity.HasCheckConstraint("CK_UploadHistory_Status", "[Status] IN ('Processing', 'Completed', 'Failed')");

            entity.HasOne(d => d.AssessmentItem)
                .WithMany(p => p.UploadHistories)
                .HasConstraintName("FK__UploadHis__Asses__3864608B");

            entity.HasOne(d => d.CourseOffering)
                .WithMany(p => p.UploadHistories)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UploadHis__Cours__37703C52");

            entity.HasOne(d => d.UploadedByNavigation)
                .WithMany(p => p.UploadHistories)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UploadHis__Uploa__395884C4");
        });

        // ==================== AUDIT LOG ====================
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.OccurredAt).HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.ActorUser)
                .WithMany(p => p.AuditLogs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__AuditLog__ActorU__3A4CA8FD");
        });

        // ==================== PREDICTIONS ====================
        modelBuilder.Entity<Prediction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.GeneratedAt).HasDefaultValueSql("(sysdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            // Check constraints
            entity.HasCheckConstraint("CK_Predictions_Category", "[PredictedCategory] IN ('At-Risk', 'Safe', 'High-Achiever', 'Needs-Attention')");
            entity.HasCheckConstraint("CK_Predictions_RiskScore", "[RiskScore] >= 0 AND [RiskScore] <= 1");
            entity.HasCheckConstraint("CK_Predictions_ConfidenceScore", "[ConfidenceScore] IS NULL OR ([ConfidenceScore] >= 0 AND [ConfidenceScore] <= 1)");

            entity.HasOne(d => d.CourseEnrollment)
                .WithMany(p => p.Predictions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Predictio__Cours__3B40CD36");

            entity.HasOne(d => d.ReviewedByNavigation)
                .WithMany(p => p.Predictions)
                .HasConstraintName("FK__Predictio__Revie__3C34F16F");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}