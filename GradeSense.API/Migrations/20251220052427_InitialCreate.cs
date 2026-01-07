using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GradeSense.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    FullName = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.CheckConstraint("CK_Users_Role", "[Role] IN ('Student', 'Faculty', 'Admin')");
                });

            migrationBuilder.CreateTable(
                name: "AuditLog",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Action = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    ActorUserId = table.Column<int>(type: "int", nullable: false),
                    EntityName = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    EntityId = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    OldValue = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    NewValue = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    ChangedFields = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    OccurredAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    IPAddress = table.Column<string>(type: "varchar(45)", unicode: false, maxLength: 45, nullable: true),
                    UserAgent = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    SessionId = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    Reason = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLog", x => x.Id);
                    table.ForeignKey(
                        name: "FK__AuditLog__ActorU__3A4CA8FD",
                        column: x => x.ActorUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    Code = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    HODUserId = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Departmen__HODUs__1EA48E88",
                        column: x => x.HODUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Faculties",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    EmployeeId = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    Designation = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    JoiningDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Qualification = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    Specialization = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Faculties", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Faculties__Depar__208CD6FA",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Faculties__Id__1F98B2C1",
                        column: x => x.Id,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Students",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    EnrollmentNumber = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    AdmissionYear = table.Column<int>(type: "int", nullable: false),
                    CurrentSemester = table.Column<int>(type: "int", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false, defaultValue: "Active"),
                    Cgpa = table.Column<decimal>(type: "decimal(4,2)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Students", x => x.Id);
                    table.CheckConstraint("CK_Students_CGPA", "[CGPA] BETWEEN 0 AND 10");
                    table.CheckConstraint("CK_Students_Status", "[Status] IN ('Active', 'Suspended', 'Graduated', 'Dropped')");
                    table.ForeignKey(
                        name: "FK__Students__Depart__22751F6C",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Students__Id__2180FB33",
                        column: x => x.Id,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Subjects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    Name = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    Credit = table.Column<decimal>(type: "decimal(3,1)", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    Semester = table.Column<int>(type: "int", nullable: true),
                    SubjectType = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    IsElective = table.Column<bool>(type: "bit", nullable: false),
                    PrerequisiteSubjectId = table.Column<int>(type: "int", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Syllabus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Subjects__Depart__25518C17",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Subjects__Prereq__2645B050",
                        column: x => x.PrerequisiteSubjectId,
                        principalTable: "Subjects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Batches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    Semester = table.Column<int>(type: "int", nullable: false),
                    AcademicYear = table.Column<int>(type: "int", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    ClassCoordinatorId = table.Column<int>(type: "int", nullable: true),
                    Division = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Batches", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Batches__ClassCo__245D67DE",
                        column: x => x.ClassCoordinatorId,
                        principalTable: "Faculties",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Batches__Departm__236943A5",
                        column: x => x.DepartmentId,
                        principalTable: "Departments",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SubjectUnits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubjectId = table.Column<int>(type: "int", nullable: false),
                    UnitNumber = table.Column<int>(type: "int", nullable: false),
                    TopicName = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    TeachingHours = table.Column<int>(type: "int", nullable: false),
                    Weightage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    LearningOutcomes = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubjectUnits", x => x.Id);
                    table.ForeignKey(
                        name: "FK__SubjectUn__Subje__2739D489",
                        column: x => x.SubjectId,
                        principalTable: "Subjects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CourseOfferings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SubjectId = table.Column<int>(type: "int", nullable: false),
                    BatchId = table.Column<int>(type: "int", nullable: false),
                    SubjectCoordinatorId = table.Column<int>(type: "int", nullable: false),
                    AcademicYear = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    MaxEnrollment = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseOfferings", x => x.Id);
                    table.ForeignKey(
                        name: "FK__CourseOff__Batch__29221CFB",
                        column: x => x.BatchId,
                        principalTable: "Batches",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__CourseOff__Subje__282DF8C2",
                        column: x => x.SubjectId,
                        principalTable: "Subjects",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__CourseOff__Subje__2A164134",
                        column: x => x.SubjectCoordinatorId,
                        principalTable: "Faculties",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CourseEnrollments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseOfferingId = table.Column<int>(type: "int", nullable: false),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    RollNumber = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    EnrollmentDate = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Active"),
                    AttendancePercentage = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Grade = table.Column<string>(type: "varchar(5)", unicode: false, maxLength: 5, nullable: true),
                    GradePoints = table.Column<decimal>(type: "decimal(4,2)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseEnrollments", x => x.Id);
                    table.CheckConstraint("CK_CourseEnrollments_GradePoints", "[GradePoints] IS NULL OR [GradePoints] BETWEEN 0 AND 10");
                    table.CheckConstraint("CK_CourseEnrollments_Status", "[Status] IN ('Active', 'Completed', 'Dropped', 'Withdrawn')");
                    table.ForeignKey(
                        name: "FK__CourseEnr__Cours__2B0A656D",
                        column: x => x.CourseOfferingId,
                        principalTable: "CourseOfferings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__CourseEnr__Stude__2BFE89A6",
                        column: x => x.StudentId,
                        principalTable: "Students",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "EvaluationSchemes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseOfferingId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    TotalMarks = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    PassingMarks = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    EvaluationType = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvaluationSchemes", x => x.Id);
                    table.ForeignKey(
                        name: "FK__Evaluatio__Cours__2CF2ADDF",
                        column: x => x.CourseOfferingId,
                        principalTable: "CourseOfferings",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "FacultyAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseOfferingId = table.Column<int>(type: "int", nullable: false),
                    FacultyId = table.Column<int>(type: "int", nullable: false),
                    Role = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    AssignmentDate = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FacultyAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK__FacultyAs__Cours__339FAB6E",
                        column: x => x.CourseOfferingId,
                        principalTable: "CourseOfferings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__FacultyAs__Facul__3493CFA7",
                        column: x => x.FacultyId,
                        principalTable: "Faculties",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AttendanceRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnrollmentId = table.Column<int>(type: "int", nullable: false),
                    AttendanceDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    RecordedBy = table.Column<int>(type: "int", nullable: true),
                    Remarks = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceRecords", x => x.Id);
                    table.CheckConstraint("CK_AttendanceRecords_Status", "[Status] IN ('Present', 'Absent', 'Excused', 'Late')");
                    table.ForeignKey(
                        name: "FK__Attendanc__Enrol__3587F3E0",
                        column: x => x.EnrollmentId,
                        principalTable: "CourseEnrollments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Attendanc__Recor__367C1819",
                        column: x => x.RecordedBy,
                        principalTable: "Faculties",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Predictions",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(36)", unicode: false, maxLength: 36, nullable: false),
                    CourseEnrollmentId = table.Column<int>(type: "int", nullable: false),
                    PredictedCategory = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RiskScore = table.Column<decimal>(type: "decimal(5,4)", nullable: false),
                    ConfidenceScore = table.Column<decimal>(type: "decimal(5,4)", nullable: true),
                    PredictedGrade = table.Column<string>(type: "varchar(5)", unicode: false, maxLength: 5, nullable: true),
                    PredictedMarks = table.Column<decimal>(type: "decimal(6,2)", nullable: true),
                    ModelVersion = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    ModelAccuracy = table.Column<decimal>(type: "decimal(5,4)", nullable: true),
                    FeatureImportance = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    ExplanationJson = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    RecommendedActions = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    GeneratedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    ReviewedBy = table.Column<int>(type: "int", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReviewNotes = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Predictions", x => x.Id);
                    table.CheckConstraint("CK_Predictions_Category", "[PredictedCategory] IN ('At-Risk', 'Safe', 'High-Achiever', 'Needs-Attention')");
                    table.CheckConstraint("CK_Predictions_ConfidenceScore", "[ConfidenceScore] IS NULL OR ([ConfidenceScore] >= 0 AND [ConfidenceScore] <= 1)");
                    table.CheckConstraint("CK_Predictions_RiskScore", "[RiskScore] >= 0 AND [RiskScore] <= 1");
                    table.ForeignKey(
                        name: "FK__Predictio__Cours__3B40CD36",
                        column: x => x.CourseEnrollmentId,
                        principalTable: "CourseEnrollments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Predictio__Revie__3C34F16F",
                        column: x => x.ReviewedBy,
                        principalTable: "Faculties",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AssessmentItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EvaluationSchemeId = table.Column<int>(type: "int", nullable: false),
                    SubjectUnitId = table.Column<int>(type: "int", nullable: true),
                    Name = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    MaxMarks = table.Column<decimal>(type: "decimal(6,2)", nullable: false),
                    CalculationType = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false, defaultValue: "Raw"),
                    Weight = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    ScheduledDate = table.Column<DateOnly>(type: "date", nullable: true),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssessmentItems", x => x.Id);
                    table.CheckConstraint("CK_AssessmentItems_CalculationType", "[CalculationType] IN ('Raw', 'Average', 'BestOf')");
                    table.ForeignKey(
                        name: "FK__Assessmen__Creat__2FCF1A8A",
                        column: x => x.CreatedBy,
                        principalTable: "Faculties",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Assessmen__Evalu__2DE6D218",
                        column: x => x.EvaluationSchemeId,
                        principalTable: "EvaluationSchemes",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__Assessmen__Subje__2EDAF651",
                        column: x => x.SubjectUnitId,
                        principalTable: "SubjectUnits",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "StudentMarks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnrollmentId = table.Column<int>(type: "int", nullable: false),
                    AssessmentItemId = table.Column<int>(type: "int", nullable: false),
                    ObtainedMarks = table.Column<decimal>(type: "decimal(6,2)", nullable: true),
                    IsAbsent = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    Remarks = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    GraderId = table.Column<int>(type: "int", nullable: false),
                    GradedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    SubmissionDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentMarks", x => x.Id);
                    table.CheckConstraint("CK_StudentMarks_ObtainedMarks", "[ObtainedMarks] IS NULL OR [IsAbsent] = 0");
                    table.ForeignKey(
                        name: "FK__StudentMa__Asses__31B762FC",
                        column: x => x.AssessmentItemId,
                        principalTable: "AssessmentItems",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__StudentMa__Enrol__30C33EC3",
                        column: x => x.EnrollmentId,
                        principalTable: "CourseEnrollments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__StudentMa__Grade__32AB8735",
                        column: x => x.GraderId,
                        principalTable: "Faculties",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "UploadHistory",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(36)", unicode: false, maxLength: 36, nullable: false),
                    CourseOfferingId = table.Column<int>(type: "int", nullable: false),
                    AssessmentItemId = table.Column<int>(type: "int", nullable: true),
                    UploadedBy = table.Column<int>(type: "int", nullable: false),
                    FileName = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: true),
                    SuccessCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    ErrorCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    TotalCount = table.Column<int>(type: "int", nullable: false),
                    ErrorDetails = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    RowDataBlob = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    Status = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false, defaultValue: "Processing"),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(sysdatetime())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UploadHistory", x => x.Id);
                    table.CheckConstraint("CK_UploadHistory_Status", "[Status] IN ('Processing', 'Completed', 'Failed')");
                    table.ForeignKey(
                        name: "FK__UploadHis__Asses__3864608B",
                        column: x => x.AssessmentItemId,
                        principalTable: "AssessmentItems",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__UploadHis__Cours__37703C52",
                        column: x => x.CourseOfferingId,
                        principalTable: "CourseOfferings",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__UploadHis__Uploa__395884C4",
                        column: x => x.UploadedBy,
                        principalTable: "Faculties",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentItems_CreatedBy",
                table: "AssessmentItems",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentItems_EvaluationSchemeId",
                table: "AssessmentItems",
                column: "EvaluationSchemeId");

            migrationBuilder.CreateIndex(
                name: "IX_AssessmentItems_SubjectUnitId",
                table: "AssessmentItems",
                column: "SubjectUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_EnrollmentId",
                table: "AttendanceRecords",
                column: "EnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_RecordedBy",
                table: "AttendanceRecords",
                column: "RecordedBy");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLog_ActorUserId",
                table: "AuditLog",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Batches_ClassCoordinatorId",
                table: "Batches",
                column: "ClassCoordinatorId");

            migrationBuilder.CreateIndex(
                name: "IX_Batches_DepartmentId",
                table: "Batches",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseEnrollments_StudentId",
                table: "CourseEnrollments",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "UQ__CourseEn__C101C94234A927E2",
                table: "CourseEnrollments",
                columns: new[] { "CourseOfferingId", "RollNumber" },
                unique: true,
                filter: "[RollNumber] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CourseOfferings_BatchId",
                table: "CourseOfferings",
                column: "BatchId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseOfferings_SubjectCoordinatorId",
                table: "CourseOfferings",
                column: "SubjectCoordinatorId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseOfferings_SubjectId",
                table: "CourseOfferings",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_HODUserId",
                table: "Departments",
                column: "HODUserId");

            migrationBuilder.CreateIndex(
                name: "UQ__Departme__737584F6CB232671",
                table: "Departments",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Departme__A25C5AA7288A8A0F",
                table: "Departments",
                column: "Code",
                unique: true,
                filter: "[Code] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EvaluationSchemes_CourseOfferingId",
                table: "EvaluationSchemes",
                column: "CourseOfferingId");

            migrationBuilder.CreateIndex(
                name: "IX_Faculties_DepartmentId",
                table: "Faculties",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "UQ__Facultie__7AD04F107CF23582",
                table: "Faculties",
                column: "EmployeeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FacultyAssignments_CourseOfferingId",
                table: "FacultyAssignments",
                column: "CourseOfferingId");

            migrationBuilder.CreateIndex(
                name: "IX_FacultyAssignments_FacultyId",
                table: "FacultyAssignments",
                column: "FacultyId");

            migrationBuilder.CreateIndex(
                name: "IX_Predictions_CourseEnrollmentId",
                table: "Predictions",
                column: "CourseEnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Predictions_ReviewedBy",
                table: "Predictions",
                column: "ReviewedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StudentMarks_AssessmentItemId",
                table: "StudentMarks",
                column: "AssessmentItemId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentMarks_EnrollmentId",
                table: "StudentMarks",
                column: "EnrollmentId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentMarks_GraderId",
                table: "StudentMarks",
                column: "GraderId");

            migrationBuilder.CreateIndex(
                name: "idx_students_department",
                table: "Students",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "idx_students_enrollment",
                table: "Students",
                column: "EnrollmentNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_students_year_sem",
                table: "Students",
                columns: new[] { "AdmissionYear", "CurrentSemester" });

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_DepartmentId",
                table: "Subjects",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_Subjects_PrerequisiteSubjectId",
                table: "Subjects",
                column: "PrerequisiteSubjectId");

            migrationBuilder.CreateIndex(
                name: "UQ__Subjects__A25C5AA70FD74FB3",
                table: "Subjects",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubjectUnits_SubjectId",
                table: "SubjectUnits",
                column: "SubjectId");

            migrationBuilder.CreateIndex(
                name: "IX_UploadHistory_AssessmentItemId",
                table: "UploadHistory",
                column: "AssessmentItemId");

            migrationBuilder.CreateIndex(
                name: "IX_UploadHistory_CourseOfferingId",
                table: "UploadHistory",
                column: "CourseOfferingId");

            migrationBuilder.CreateIndex(
                name: "IX_UploadHistory_UploadedBy",
                table: "UploadHistory",
                column: "UploadedBy");

            migrationBuilder.CreateIndex(
                name: "idx_users_active",
                table: "Users",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "idx_users_email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_users_role",
                table: "Users",
                column: "Role");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttendanceRecords");

            migrationBuilder.DropTable(
                name: "AuditLog");

            migrationBuilder.DropTable(
                name: "FacultyAssignments");

            migrationBuilder.DropTable(
                name: "Predictions");

            migrationBuilder.DropTable(
                name: "StudentMarks");

            migrationBuilder.DropTable(
                name: "UploadHistory");

            migrationBuilder.DropTable(
                name: "CourseEnrollments");

            migrationBuilder.DropTable(
                name: "AssessmentItems");

            migrationBuilder.DropTable(
                name: "Students");

            migrationBuilder.DropTable(
                name: "EvaluationSchemes");

            migrationBuilder.DropTable(
                name: "SubjectUnits");

            migrationBuilder.DropTable(
                name: "CourseOfferings");

            migrationBuilder.DropTable(
                name: "Batches");

            migrationBuilder.DropTable(
                name: "Subjects");

            migrationBuilder.DropTable(
                name: "Faculties");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
