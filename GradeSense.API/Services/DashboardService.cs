using GradeSense.API.Data;
using GradeSense.API.DTOs.Dashboard;
using GradeSense.API.Interfaces.Services;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Services;

/// <summary>
/// Dashboard service implementation with real database queries
/// </summary>
public class DashboardService : IDashboardService
{
    private readonly GradeSenseDbContext _context;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(GradeSenseDbContext context, ILogger<DashboardService> logger)
    {
        _context = context;
        _logger = logger;
    }

    #region Admin Dashboard

    public async Task<AdminDashboardResponse> GetAdminDashboardAsync()
    {
        var now = DateTime.Now;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var sixMonthsAgo = now.AddMonths(-6);

        var response = new AdminDashboardResponse();

        // User counts
        response.TotalUsers = await _context.Users.CountAsync(u => u.DeletedAt == null);
        response.ActiveUsers = await _context.Users.CountAsync(u => u.DeletedAt == null && u.IsActive);
        response.InactiveUsers = await _context.Users.CountAsync(u => u.DeletedAt == null && !u.IsActive);
        response.NewUsersThisMonth = await _context.Users
            .CountAsync(u => u.DeletedAt == null && u.CreatedAt >= startOfMonth);

        // User counts by Role (for User Distribution pie chart)
        response.StudentUsers = await _context.Users.CountAsync(u => u.DeletedAt == null && u.Role == "Student");
        response.FacultyUsers = await _context.Users.CountAsync(u => u.DeletedAt == null && u.Role == "Faculty");
        response.AdminUsers = await _context.Users.CountAsync(u => u.DeletedAt == null && u.Role == "Admin");

        // Entity counts
        response.TotalStudents = await _context.Students.CountAsync(s => s.DeletedAt == null);
        response.TotalFaculties = await _context.Faculties.CountAsync(f => f.DeletedAt == null);
        response.TotalDepartments = await _context.Departments.CountAsync(d => d.DeletedAt == null);
        response.TotalSubjects = await _context.Subjects.CountAsync(s => s.DeletedAt == null);
        response.TotalBatches = await _context.Batches.CountAsync(b => b.DeletedAt == null);
        response.TotalEvaluationSchemes = await _context.EvaluationSchemes.CountAsync(e => e.DeletedAt == null);
        response.TotalAuditLogs = await _context.AuditLogs.CountAsync(a => a.DeletedAt == null);

        // Department active/inactive counts
        response.ActiveDepartments = await _context.Departments.CountAsync(d => d.DeletedAt == null && d.IsActive);
        response.InactiveDepartments = await _context.Departments.CountAsync(d => d.DeletedAt == null && !d.IsActive);

        // Batch active/inactive counts
        response.ActiveBatches = await _context.Batches.CountAsync(b => b.DeletedAt == null && b.IsActive);
        response.InactiveBatches = await _context.Batches.CountAsync(b => b.DeletedAt == null && !b.IsActive);

        // Subject active/inactive counts
        response.ActiveSubjects = await _context.Subjects.CountAsync(s => s.DeletedAt == null && s.IsActive);
        response.InactiveSubjects = await _context.Subjects.CountAsync(s => s.DeletedAt == null && !s.IsActive);
        response.ElectiveSubjects = await _context.Subjects.CountAsync(s => s.DeletedAt == null && s.IsElective);

        // Evaluation scheme active/inactive counts
        response.ActiveEvaluationSchemes = await _context.EvaluationSchemes.CountAsync(e => e.DeletedAt == null && e.IsActive);
        response.InactiveEvaluationSchemes = await _context.EvaluationSchemes.CountAsync(e => e.DeletedAt == null && !e.IsActive);

        // Audit log action counts
        response.AuditLogCreates = await _context.AuditLogs.CountAsync(a => a.DeletedAt == null && a.Action.ToLower() == "create");
        response.AuditLogUpdates = await _context.AuditLogs.CountAsync(a => a.DeletedAt == null && a.Action.ToLower() == "update");
        response.AuditLogDeletes = await _context.AuditLogs.CountAsync(a => a.DeletedAt == null && a.Action.ToLower() == "delete");
        response.AuditLogLogins = await _context.AuditLogs.CountAsync(a => a.DeletedAt == null && (a.Action.ToLower() == "login" || a.Action.ToLower() == "logout"));

        // Faculty active/inactive counts (based on their linked User's IsActive)
        response.ActiveFaculties = await _context.Faculties
            .CountAsync(f => f.DeletedAt == null && f.IdNavigation.IsActive);
        response.InactiveFaculties = await _context.Faculties
            .CountAsync(f => f.DeletedAt == null && !f.IdNavigation.IsActive);

        // Coordinator count (faculties who are class or subject coordinators)
        var classCoordinatorIds = await _context.Batches
            .Where(b => b.DeletedAt == null && b.ClassCoordinatorId != null)
            .Select(b => b.ClassCoordinatorId!.Value)
            .Distinct()
            .ToListAsync();
        var subjectCoordinatorIds = await _context.CourseOfferings
            .Where(co => co.DeletedAt == null)
            .Select(co => co.SubjectCoordinatorId)
            .Distinct()
            .ToListAsync();
        var allCoordinatorIds = classCoordinatorIds.Union(subjectCoordinatorIds).Distinct();
        response.TotalCoordinators = allCoordinatorIds.Count();

        // Course offering counts
        response.TotalCourseOfferings = await _context.CourseOfferings.CountAsync(co => co.DeletedAt == null);
        response.ActiveCourseOfferings = await _context.CourseOfferings
            .CountAsync(co => co.DeletedAt == null && co.IsActive);
        response.InactiveCourseOfferings = await _context.CourseOfferings
            .CountAsync(co => co.DeletedAt == null && !co.IsActive);

        // Student status counts
        response.ActiveStudents = await _context.Students
            .CountAsync(s => s.DeletedAt == null && s.Status == "Active");
        response.GraduatedStudents = await _context.Students
            .CountAsync(s => s.DeletedAt == null && s.Status == "Graduated");

        // At-risk students (from predictions)
        response.AtRiskStudents = await _context.Predictions
            .CountAsync(p => p.DeletedAt == null && p.IsActive && p.PredictedCategory == "At-Risk");

        // Enrollment counts
        response.TotalEnrollments = await _context.CourseEnrollments.CountAsync(ce => ce.DeletedAt == null);
        response.ActiveEnrollments = await _context.CourseEnrollments
            .CountAsync(ce => ce.DeletedAt == null && ce.Status == "Active");
        response.CompletedEnrollments = await _context.CourseEnrollments
            .CountAsync(ce => ce.DeletedAt == null && ce.Status == "Completed");

        // Recent activities from audit log (last 30 days or all if none exist)
        response.RecentActivities = await _context.AuditLogs
            .Include(a => a.ActorUser)
            .Where(a => a.DeletedAt == null)
            .OrderByDescending(a => a.OccurredAt ?? a.CreatedAt)
            .Take(10)
            .Select(a => new RecentActivityItem
            {
                Action = a.Action,
                EntityType = a.EntityName,
                EntityName = a.EntityId,
                PerformedBy = a.ActorUser != null ? a.ActorUser.FullName : "System",
                OccurredAt = a.OccurredAt ?? a.CreatedAt ?? DateTime.MinValue
            })
            .ToListAsync();

        // Department overview
        response.DepartmentStats = await _context.Departments
            .Where(d => d.DeletedAt == null && d.IsActive)
            .Select(d => new DepartmentOverview
            {
                DepartmentId = d.Id,
                DepartmentName = d.Name,
                DepartmentCode = d.Code,
                StudentCount = d.Students.Count(s => s.DeletedAt == null),
                FacultyCount = d.Faculties.Count(f => f.DeletedAt == null),
                SubjectCount = d.Subjects.Count(s => s.DeletedAt == null),
                ActiveCourses = d.Batches
                    .SelectMany(b => b.CourseOfferings)
                    .Count(co => co.DeletedAt == null && co.IsActive)
            })
            .ToListAsync();

        // Enrollment trends (last 6 months) - fetch data first, then process in memory
        var enrollmentData = await _context.CourseEnrollments
            .Where(ce => ce.DeletedAt == null && ce.CreatedAt >= sixMonthsAgo)
            .Select(ce => new { ce.CreatedAt })
            .ToListAsync();

        response.EnrollmentTrends = enrollmentData
            .Where(e => e.CreatedAt.HasValue)
            .GroupBy(e => new { e.CreatedAt!.Value.Year, e.CreatedAt!.Value.Month })
            .Select(g => new MonthlyStatItem
            {
                Year = g.Key.Year,
                Month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM"),
                Count = g.Count()
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToList();

        return response;
    }

    #endregion

    #region Student Dashboard

    public async Task<StudentDashboardResponse> GetStudentDashboardAsync(int studentId)
    {
        var student = await _context.Students
            .Include(s => s.IdNavigation)
            .Include(s => s.Department)
            .FirstOrDefaultAsync(s => s.Id == studentId && s.DeletedAt == null);

        if (student == null)
            throw new KeyNotFoundException($"Student with ID {studentId} not found");

        var response = new StudentDashboardResponse
        {
            StudentId = student.Id,
            FullName = student.IdNavigation.FullName,
            Email = student.IdNavigation.PersonalEmail,
            EnrollmentNumber = student.EnrollmentNumber,
            DepartmentName = student.Department.Name,
            CurrentSemester = student.CurrentSemester,
            CGPA = student.Cgpa,
            Status = student.Status
        };

        // Enrollment counts
        var enrollments = await _context.CourseEnrollments
            .Include(ce => ce.CourseOffering)
                .ThenInclude(co => co.Subject)
            .Include(ce => ce.CourseOffering)
                .ThenInclude(co => co.FacultyAssignments)
                    .ThenInclude(fa => fa.Faculty)
                        .ThenInclude(f => f.IdNavigation)
            .Where(ce => ce.StudentId == studentId && ce.DeletedAt == null)
            .ToListAsync();

        response.TotalEnrolledCourses = enrollments.Count;
        response.ActiveCourses = enrollments.Count(e => e.Status == "Active");
        response.CompletedCourses = enrollments.Count(e => e.Status == "Completed");
        response.DroppedCourses = enrollments.Count(e => e.Status == "Dropped" || e.Status == "Withdrawn");

        // Calculate credits
        response.TotalCreditsEarned = enrollments
            .Where(e => e.Status == "Completed")
            .Sum(e => e.CourseOffering.Subject.Credit);
        response.TotalCreditsAttempted = enrollments
            .Where(e => e.Status != "Dropped" && e.Status != "Withdrawn")
            .Sum(e => e.CourseOffering.Subject.Credit);

        // Current courses with details
        response.CurrentCourses = enrollments
            .Where(e => e.Status == "Active")
            .Select(e => new StudentCourseItem
            {
                EnrollmentId = e.Id,
                CourseOfferingId = e.CourseOfferingId,
                SubjectCode = e.CourseOffering.Subject.Code,
                SubjectName = e.CourseOffering.Subject.Name,
                Credits = e.CourseOffering.Subject.Credit,
                FacultyName = e.CourseOffering.FacultyAssignments
                    .FirstOrDefault()?.Faculty.IdNavigation.FullName ?? "TBA",
                Status = e.Status,
                CurrentScore = null, // Will be calculated from marks
                CurrentGrade = e.Grade,
                AttendancePercentage = 0 // Will be calculated
            })
            .ToList();

        // Calculate attendance and scores for each course
        foreach (var course in response.CurrentCourses)
        {
            // Attendance
            var attendanceRecords = await _context.AttendanceRecords
                .Where(ar => ar.EnrollmentId == course.EnrollmentId && ar.DeletedAt == null)
                .ToListAsync();

            if (attendanceRecords.Any())
            {
                var present = attendanceRecords.Count(ar => ar.Status == "Present" || ar.Status == "Late");
                course.AttendancePercentage = Math.Round((decimal)present / attendanceRecords.Count * 100, 1);
            }

            // Current score (average of all assessments)
            var marks = await _context.StudentMarks
                .Include(sm => sm.AssessmentItem)
                .Where(sm => sm.EnrollmentId == course.EnrollmentId && sm.DeletedAt == null && !sm.IsAbsent)
                .ToListAsync();

            if (marks.Any())
            {
                var totalObtained = marks.Sum(m => m.ObtainedMarks ?? 0);
                var totalMax = marks.Sum(m => m.AssessmentItem.MaxMarks);
                course.CurrentScore = totalMax > 0 ? Math.Round(totalObtained / totalMax * 100, 1) : null;
            }
        }

        // Overall attendance
        var allAttendance = await _context.AttendanceRecords
            .Where(ar => ar.Enrollment.StudentId == studentId && ar.DeletedAt == null)
            .ToListAsync();

        if (allAttendance.Any())
        {
            response.TotalClassesAttended = allAttendance.Count(ar => ar.Status == "Present" || ar.Status == "Late");
            response.TotalClassesMissed = allAttendance.Count(ar => ar.Status == "Absent");
            response.OverallAttendancePercentage = Math.Round(
                (decimal)response.TotalClassesAttended / allAttendance.Count * 100, 1);
        }

        // Recent grades (last 10)
        response.RecentGrades = await _context.StudentMarks
            .Include(sm => sm.AssessmentItem)
            .Include(sm => sm.Enrollment)
                .ThenInclude(e => e.CourseOffering)
                    .ThenInclude(co => co.Subject)
            .Where(sm => sm.Enrollment.StudentId == studentId && sm.DeletedAt == null)
            .OrderByDescending(sm => sm.GradedDate)
            .Take(10)
            .Select(sm => new RecentGradeItem
            {
                SubjectName = sm.Enrollment.CourseOffering.Subject.Name,
                AssessmentName = sm.AssessmentItem.Name,
                MaxMarks = sm.AssessmentItem.MaxMarks,
                ObtainedMarks = sm.ObtainedMarks,
                Percentage = sm.ObtainedMarks.HasValue
                    ? Math.Round(sm.ObtainedMarks.Value / sm.AssessmentItem.MaxMarks * 100, 1)
                    : null,
                GradedDate = sm.GradedDate
            })
            .ToListAsync();

        // Grade Trend for line chart (last 20 graded assessments)
        response.GradeTrend = await _context.StudentMarks
            .Include(sm => sm.AssessmentItem)
            .Include(sm => sm.Enrollment)
                .ThenInclude(e => e.CourseOffering)
                    .ThenInclude(co => co.Subject)
            .Where(sm => sm.Enrollment.StudentId == studentId 
                && sm.DeletedAt == null 
                && sm.GradedDate != null 
                && sm.ObtainedMarks != null)
            .OrderBy(sm => sm.GradedDate)
            .Take(20)
            .Select(sm => new GradeTrendItem
            {
                Date = sm.GradedDate!.Value.ToString("MMM dd"),
                AssessmentName = sm.AssessmentItem.Name,
                SubjectCode = sm.Enrollment.CourseOffering.Subject.Code,
                Percentage = Math.Round(sm.ObtainedMarks!.Value / sm.AssessmentItem.MaxMarks * 100, 1)
            })
            .ToListAsync();

        // Subject-wise Performance (aggregated scores per subject)
        response.SubjectPerformances = await _context.StudentMarks
            .Include(sm => sm.AssessmentItem)
            .Include(sm => sm.Enrollment)
                .ThenInclude(e => e.CourseOffering)
                    .ThenInclude(co => co.Subject)
            .Where(sm => sm.Enrollment.StudentId == studentId 
                && sm.DeletedAt == null 
                && sm.ObtainedMarks != null
                && sm.Enrollment.Status == "Active")
            .GroupBy(sm => new { 
                sm.Enrollment.CourseOffering.Subject.Code, 
                sm.Enrollment.CourseOffering.Subject.Name 
            })
            .Select(g => new SubjectPerformance
            {
                SubjectCode = g.Key.Code,
                SubjectName = g.Key.Name,
                Score = g.Sum(m => m.ObtainedMarks ?? 0),
                MaxScore = g.Sum(m => m.AssessmentItem.MaxMarks),
                Percentage = g.Sum(m => m.AssessmentItem.MaxMarks) > 0 
                    ? Math.Round(g.Sum(m => m.ObtainedMarks ?? 0) / g.Sum(m => m.AssessmentItem.MaxMarks) * 100, 1) 
                    : 0,
                AssessmentCount = g.Count()
            })
            .ToListAsync();

        // Course Attendance breakdown
        response.CourseAttendances = await _context.AttendanceRecords
            .Include(ar => ar.Enrollment)
                .ThenInclude(e => e.CourseOffering)
                    .ThenInclude(co => co.Subject)
            .Where(ar => ar.Enrollment.StudentId == studentId 
                && ar.DeletedAt == null
                && ar.Enrollment.Status == "Active")
            .GroupBy(ar => new {
                ar.Enrollment.CourseOffering.Subject.Code,
                ar.Enrollment.CourseOffering.Subject.Name
            })
            .Select(g => new CourseAttendance
            {
                SubjectCode = g.Key.Code,
                SubjectName = g.Key.Name,
                TotalClasses = g.Count(),
                Present = g.Count(a => a.Status == "Present"),
                Absent = g.Count(a => a.Status == "Absent"),
                Late = g.Count(a => a.Status == "Late"),
                Percentage = g.Count() > 0 
                    ? Math.Round((decimal)(g.Count(a => a.Status == "Present" || a.Status == "Late")) / g.Count() * 100, 1) 
                    : 0
            })
            .ToListAsync();

        // Semester Performance Trend (historical semester data)
        response.PerformanceTrend = await _context.CourseEnrollments
            .Include(ce => ce.CourseOffering)
                .ThenInclude(co => co.Subject)
            .Where(ce => ce.StudentId == studentId 
                && ce.DeletedAt == null 
                && ce.Status == "Completed"
                && ce.CourseOffering.Subject.Semester != null)
            .GroupBy(ce => ce.CourseOffering.Subject.Semester!.Value)
            .Select(g => new SemesterPerformance
            {
                Semester = g.Key,
                CreditsEarned = (int)g.Sum(e => e.CourseOffering.Subject.Credit),
                GPA = null, // Would need grade-to-GPA calculation
                AttendancePercentage = 0 // Would need attendance lookup
            })
            .OrderBy(sp => sp.Semester)
            .ToListAsync();

        // Get latest prediction for risk status
        var prediction = await _context.Predictions
            .Where(p => p.CourseEnrollment.StudentId == studentId && p.IsActive && p.DeletedAt == null)
            .OrderByDescending(p => p.GeneratedAt)
            .FirstOrDefaultAsync();

        if (prediction != null)
        {
            response.RiskStatus = prediction.PredictedCategory;
            response.RiskScore = prediction.RiskScore;
            if (!string.IsNullOrEmpty(prediction.RecommendedActions))
            {
                response.Recommendations = prediction.RecommendedActions.Split(';').ToList();
            }
        }

        return response;
    }

    #endregion

    #region Faculty Dashboard

    public async Task<FacultyDashboardResponse> GetFacultyDashboardAsync(int facultyId)
    {
        var faculty = await _context.Faculties
            .Include(f => f.IdNavigation)
            .Include(f => f.Department)
            .FirstOrDefaultAsync(f => f.Id == facultyId && f.DeletedAt == null);

        if (faculty == null)
            throw new KeyNotFoundException($"Faculty with ID {facultyId} not found");

        var response = new FacultyDashboardResponse
        {
            FacultyId = faculty.Id,
            FullName = faculty.IdNavigation.FullName,
            Email = faculty.IdNavigation.PersonalEmail,
            EmployeeId = faculty.EmployeeId,
            DepartmentName = faculty.Department.Name,
            Designation = faculty.Designation
        };

        // Get faculty assignments
        var assignments = await _context.FacultyAssignments
            .Include(fa => fa.CourseOffering)
                .ThenInclude(co => co.Subject)
            .Include(fa => fa.CourseOffering)
                .ThenInclude(co => co.Batch)
            .Include(fa => fa.CourseOffering)
                .ThenInclude(co => co.CourseEnrollments)
            .Where(fa => fa.FacultyId == facultyId && fa.DeletedAt == null)
            .ToListAsync();

        var activeAssignments = assignments.Where(a => a.CourseOffering.IsActive && a.CourseOffering.DeletedAt == null).ToList();

        response.TotalCoursesTeaching = assignments.Count;
        response.ActiveCourses = activeAssignments.Count;
        response.TotalStudentsEnrolled = activeAssignments
            .SelectMany(a => a.CourseOffering.CourseEnrollments)
            .Count(ce => ce.Status == "Active" && ce.DeletedAt == null);

        // Current courses with stats
        response.CurrentCourses = new List<FacultyCourseItem>();
        foreach (var assignment in activeAssignments)
        {
            var co = assignment.CourseOffering;
            var enrolledStudents = co.CourseEnrollments
                .Where(ce => ce.Status == "Active" && ce.DeletedAt == null)
                .ToList();

            // Get assessment items for this course
            var assessmentIds = await _context.AssessmentItems
                .Where(ai => ai.EvaluationScheme.CourseOfferingId == co.Id && ai.DeletedAt == null)
                .Select(ai => ai.Id)
                .ToListAsync();

            // Count pending grades
            var totalMarksNeeded = assessmentIds.Count * enrolledStudents.Count;
            var marksEntered = await _context.StudentMarks
                .CountAsync(sm => assessmentIds.Contains(sm.AssessmentItemId) && sm.DeletedAt == null);
            var pendingGrades = totalMarksNeeded - marksEntered;

            // Calculate average score
            var marks = await _context.StudentMarks
                .Include(sm => sm.AssessmentItem)
                .Where(sm => assessmentIds.Contains(sm.AssessmentItemId) && sm.DeletedAt == null && !sm.IsAbsent)
                .ToListAsync();

            decimal avgScore = 0;
            if (marks.Any())
            {
                var totalObtained = marks.Sum(m => m.ObtainedMarks ?? 0);
                var totalMax = marks.Sum(m => m.AssessmentItem.MaxMarks);
                avgScore = totalMax > 0 ? Math.Round(totalObtained / totalMax * 100, 1) : 0;
            }

            // Calculate average attendance
            var enrollmentIds = enrolledStudents.Select(e => e.Id).ToList();
            var attendanceRecords = await _context.AttendanceRecords
                .Where(ar => enrollmentIds.Contains(ar.EnrollmentId) && ar.DeletedAt == null)
                .ToListAsync();

            decimal avgAttendance = 0;
            if (attendanceRecords.Any())
            {
                var present = attendanceRecords.Count(ar => ar.Status == "Present" || ar.Status == "Late");
                avgAttendance = Math.Round((decimal)present / attendanceRecords.Count * 100, 1);
            }

            response.CurrentCourses.Add(new FacultyCourseItem
            {
                CourseOfferingId = co.Id,
                SubjectId = co.SubjectId,
                SubjectCode = co.Subject.Code,
                SubjectName = co.Subject.Name,
                BatchName = co.Batch.Name,
                Semester = co.Batch.Semester,
                AcademicYear = co.AcademicYear,
                EnrolledStudents = enrolledStudents.Count,
                PendingGrades = Math.Max(0, pendingGrades),
                AverageScore = avgScore,
                AverageAttendance = avgAttendance,
                IsCoordinator = co.SubjectCoordinatorId == facultyId,
                StartDate = co.StartDate.HasValue ? co.StartDate.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null,
                EndDate = co.EndDate.HasValue ? co.EndDate.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null,
            });
        }

        // Grading stats
        var allAssessmentIds = await _context.AssessmentItems
            .Where(ai => ai.CreatedBy == facultyId && ai.DeletedAt == null)
            .Select(ai => ai.Id)
            .ToListAsync();

        response.TotalAssessmentsCreated = allAssessmentIds.Count;
        response.GradedAssessments = await _context.StudentMarks
            .Where(sm => allAssessmentIds.Contains(sm.AssessmentItemId) && sm.DeletedAt == null)
            .Select(sm => sm.AssessmentItemId)
            .Distinct()
            .CountAsync();

        // Pending grade items
        response.PendingGradeItems = new List<PendingGradeItem>();
        foreach (var assignment in activeAssignments)
        {
            var courseAssessments = await _context.AssessmentItems
                .Include(ai => ai.EvaluationScheme)
                    .ThenInclude(es => es.CourseOffering)
                        .ThenInclude(co => co.Subject)
                .Include(ai => ai.EvaluationScheme)
                    .ThenInclude(es => es.CourseOffering)
                        .ThenInclude(co => co.Batch)
                .Where(ai => ai.EvaluationScheme.CourseOfferingId == assignment.CourseOfferingId 
                          && ai.DeletedAt == null 
                          && ai.IsActive)
                .ToListAsync();

            var enrolledCount = assignment.CourseOffering.CourseEnrollments
                .Count(ce => ce.Status == "Active" && ce.DeletedAt == null);

            foreach (var assessment in courseAssessments)
            {
                var gradedCount = await _context.StudentMarks
                    .CountAsync(sm => sm.AssessmentItemId == assessment.Id && sm.DeletedAt == null);

                var pending = enrolledCount - gradedCount;
                if (pending > 0)
                {
                    response.PendingGradeItems.Add(new PendingGradeItem
                    {
                        AssessmentItemId = assessment.Id,
                        AssessmentName = assessment.Name,
                        SubjectName = assessment.EvaluationScheme.CourseOffering.Subject.Name,
                        BatchName = assessment.EvaluationScheme.CourseOffering.Batch.Name,
                        TotalStudents = enrolledCount,
                        GradedCount = gradedCount,
                        PendingCount = pending
                    });
                }
            }
        }

        response.PendingGrades = response.PendingGradeItems.Sum(p => p.PendingCount);

        // Student performance distribution
        var allMarks = await _context.StudentMarks
            .Include(sm => sm.AssessmentItem)
            .Where(sm => allAssessmentIds.Contains(sm.AssessmentItemId) && sm.DeletedAt == null && !sm.IsAbsent)
            .ToListAsync();

        if (allMarks.Any())
        {
            var percentages = allMarks
                .Where(m => m.ObtainedMarks.HasValue)
                .Select(m => m.ObtainedMarks!.Value / m.AssessmentItem.MaxMarks * 100)
                .ToList();

            response.StudentPerformance = new PerformanceDistribution
            {
                ExcellentCount = percentages.Count(p => p >= 90),
                GoodCount = percentages.Count(p => p >= 70 && p < 90),
                AverageCount = percentages.Count(p => p >= 50 && p < 70),
                BelowAverageCount = percentages.Count(p => p >= 40 && p < 50),
                FailingCount = percentages.Count(p => p < 40)
            };
        }

        // At-risk students
        response.AtRiskStudents = new List<AtRiskStudentItem>();
        foreach (var assignment in activeAssignments)
        {
            var courseEnrollments = assignment.CourseOffering.CourseEnrollments
                .Where(ce => ce.Status == "Active" && ce.DeletedAt == null)
                .ToList();

            foreach (var enrollment in courseEnrollments)
            {
                var student = await _context.Students
                    .Include(s => s.IdNavigation)
                    .FirstOrDefaultAsync(s => s.Id == enrollment.StudentId);

                if (student == null) continue;

                // Check attendance
                var attendance = await _context.AttendanceRecords
                    .Where(ar => ar.EnrollmentId == enrollment.Id && ar.DeletedAt == null)
                    .ToListAsync();

                decimal attendancePct = 100;
                if (attendance.Any())
                {
                    var present = attendance.Count(a => a.Status == "Present" || a.Status == "Late");
                    attendancePct = Math.Round((decimal)present / attendance.Count * 100, 1);
                }

                // Check marks
                var studentMarks = await _context.StudentMarks
                    .Include(sm => sm.AssessmentItem)
                    .Where(sm => sm.EnrollmentId == enrollment.Id && sm.DeletedAt == null && !sm.IsAbsent)
                    .ToListAsync();

                decimal? scorePct = null;
                if (studentMarks.Any())
                {
                    var obtained = studentMarks.Sum(m => m.ObtainedMarks ?? 0);
                    var max = studentMarks.Sum(m => m.AssessmentItem.MaxMarks);
                    scorePct = max > 0 ? Math.Round(obtained / max * 100, 1) : 0;
                }

                // Determine if at-risk
                string? riskReason = null;
                if (attendancePct < 75)
                    riskReason = "Low attendance";
                else if (scorePct.HasValue && scorePct < 40)
                    riskReason = "Failing grades";
                else if (scorePct.HasValue && scorePct < 50)
                    riskReason = "Below average performance";

                if (riskReason != null)
                {
                    response.AtRiskStudents.Add(new AtRiskStudentItem
                    {
                        StudentId = student.Id,
                        StudentName = student.IdNavigation.FullName,
                        EnrollmentNumber = student.EnrollmentNumber,
                        SubjectName = assignment.CourseOffering.Subject.Name,
                        CurrentScore = scorePct,
                        AttendancePercentage = attendancePct,
                        RiskReason = riskReason
                    });
                }
            }
        }

        // Limit at-risk students to top 10
        response.AtRiskStudents = response.AtRiskStudents
            .OrderBy(s => s.CurrentScore ?? 0)
            .ThenBy(s => s.AttendancePercentage)
            .Take(10)
            .ToList();

        return response;
    }

    #endregion

    #region Attendance Calendar

    public async Task<AttendanceCalendarResponse> GetAttendanceCalendarAsync(int studentId, int? year = null, int? month = null, int? courseOfferingId = null)
    {
        var now = DateTime.Today;
        var targetYear = year ?? now.Year;
        var targetMonth = month ?? now.Month;
        var today = DateOnly.FromDateTime(now);

        var firstDayOfMonth = new DateOnly(targetYear, targetMonth, 1);
        var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

        var response = new AttendanceCalendarResponse
        {
            StudentId = studentId,
            Year = targetYear,
            Month = targetMonth,
            MonthName = firstDayOfMonth.ToString("MMMM yyyy"),
            CourseOfferingId = courseOfferingId
        };

        // Get student enrollments
        var enrollments = await _context.CourseEnrollments
            .Include(ce => ce.CourseOffering)
                .ThenInclude(co => co.Subject)
            .Where(ce => ce.StudentId == studentId && ce.DeletedAt == null && ce.Status == "Active")
            .ToListAsync();

        if (!enrollments.Any())
        {
            return response;
        }

        // Populate available courses for filter
        response.AvailableCourses = enrollments.Select(e => new AttendanceCalendarCourse
        {
            CourseOfferingId = e.CourseOfferingId,
            EnrollmentId = e.Id,
            SubjectCode = e.CourseOffering.Subject.Code,
            SubjectName = e.CourseOffering.Subject.Name,
            AttendancePercentage = e.AttendancePercentage ?? 0
        }).ToList();

        // Filter enrollments if course filter applied
        var filteredEnrollments = courseOfferingId.HasValue
            ? enrollments.Where(e => e.CourseOfferingId == courseOfferingId.Value).ToList()
            : enrollments;

        if (courseOfferingId.HasValue)
        {
            var course = response.AvailableCourses.FirstOrDefault(c => c.CourseOfferingId == courseOfferingId.Value);
            if (course != null)
            {
                response.SubjectCode = course.SubjectCode;
                response.SubjectName = course.SubjectName;
            }
        }

        var enrollmentIds = filteredEnrollments.Select(e => e.Id).ToList();

        // Get attendance records for the month
        var attendanceRecords = await _context.AttendanceRecords
            .Include(ar => ar.Enrollment)
                .ThenInclude(e => e.CourseOffering)
                .ThenInclude(co => co.Subject)
            .Include(ar => ar.RecordedByNavigation)
                .ThenInclude(f => f!.IdNavigation)
            .Where(ar => enrollmentIds.Contains(ar.EnrollmentId)
                      && ar.DeletedAt == null
                      && ar.AttendanceDate >= firstDayOfMonth
                      && ar.AttendanceDate <= lastDayOfMonth)
            .OrderBy(ar => ar.AttendanceDate)
            .ToListAsync();

        // Calculate summary
        response.Summary = new AttendanceCalendarSummary
        {
            TotalClasses = attendanceRecords.Count,
            PresentCount = attendanceRecords.Count(ar => ar.Status == "Present"),
            AbsentCount = attendanceRecords.Count(ar => ar.Status == "Absent"),
            LateCount = attendanceRecords.Count(ar => ar.Status == "Late"),
            ExcusedCount = attendanceRecords.Count(ar => ar.Status == "Excused")
        };

        if (response.Summary.TotalClasses > 0)
        {
            var attended = response.Summary.PresentCount + response.Summary.LateCount + response.Summary.ExcusedCount;
            response.Summary.AttendancePercentage = Math.Round((decimal)attended / response.Summary.TotalClasses * 100, 1);
        }

        // Build day-wise calendar entries
        var groupedByDate = attendanceRecords.GroupBy(ar => ar.AttendanceDate).ToDictionary(g => g.Key, g => g.ToList());

        for (var day = firstDayOfMonth; day <= lastDayOfMonth; day = day.AddDays(1))
        {
            var calendarDay = new AttendanceCalendarDay
            {
                Date = day,
                DayOfMonth = day.Day,
                IsWeekend = day.DayOfWeek == DayOfWeek.Saturday || day.DayOfWeek == DayOfWeek.Sunday,
                IsToday = day == today
            };

            if (groupedByDate.TryGetValue(day, out var dayRecords))
            {
                calendarDay.Entries = dayRecords.Select(ar => new AttendanceCalendarEntry
                {
                    AttendanceRecordId = ar.Id,
                    EnrollmentId = ar.EnrollmentId,
                    CourseOfferingId = ar.Enrollment.CourseOfferingId,
                    SubjectCode = ar.Enrollment.CourseOffering.Subject.Code,
                    SubjectName = ar.Enrollment.CourseOffering.Subject.Name,
                    Status = ar.Status,
                    Remarks = ar.Remarks,
                    RecordedByName = ar.RecordedByNavigation?.IdNavigation?.FullName
                }).ToList();
            }

            response.Days.Add(calendarDay);
        }

        return response;
    }

    #endregion

    #region Grade Analytics

    /// <summary>
    /// Get comprehensive grade analytics for a student
    /// </summary>
    public async Task<GradeAnalyticsResponse> GetGradeAnalyticsAsync(int studentId, int? semesterFilter = null)
    {
        var response = new GradeAnalyticsResponse();

        // Fetch student info
        var student = await _context.Students
            .Include(s => s.IdNavigation)
            .Include(s => s.Department)
            .FirstOrDefaultAsync(s => s.Id == studentId && s.DeletedAt == null);

        if (student == null)
        {
            throw new KeyNotFoundException($"Student with ID {studentId} not found");
        }

        response.StudentId = studentId;
        response.FullName = student.IdNavigation?.FullName ?? "Unknown";
        response.EnrollmentNumber = student.EnrollmentNumber ?? "";
        response.CurrentSemester = student.CurrentSemester;

        // Get all enrollments
        var enrollmentsQuery = _context.CourseEnrollments
            .Include(ce => ce.CourseOffering)
                .ThenInclude(co => co.Subject)
            .Include(ce => ce.StudentMarks.Where(sm => sm.DeletedAt == null))
                .ThenInclude(sm => sm.AssessmentItem)
                    .ThenInclude(ai => ai.EvaluationScheme)
            .Where(ce => ce.StudentId == studentId && ce.DeletedAt == null);

        if (semesterFilter.HasValue)
        {
            enrollmentsQuery = enrollmentsQuery.Where(ce => ce.CourseOffering.Subject.Semester == semesterFilter.Value);
        }

        var enrollments = await enrollmentsQuery.ToListAsync();

        // Calculate GPA Overview
        var completedEnrollments = enrollments.Where(e => e.Status == "Completed" && e.GradePoints.HasValue).ToList();
        if (completedEnrollments.Any())
        {
            var totalGradeCredit = completedEnrollments.Sum(e => (e.GradePoints ?? 0) * e.CourseOffering.Subject.Credit);
            var totalCredits = completedEnrollments.Sum(e => e.CourseOffering.Subject.Credit);
            response.CGPA = totalCredits > 0 ? Math.Round(totalGradeCredit / totalCredits, 2) : null;
            response.TotalCreditsEarned = totalCredits;
        }

        response.TotalCreditsAttempted = enrollments.Sum(e => e.CourseOffering.Subject.Credit);

        // Calculate current semester GPA
        var currentSemEnrollments = completedEnrollments
            .Where(e => e.CourseOffering.Subject.Semester == response.CurrentSemester)
            .ToList();
        if (currentSemEnrollments.Any())
        {
            var semGradeCredit = currentSemEnrollments.Sum(e => (e.GradePoints ?? 0) * e.CourseOffering.Subject.Credit);
            var semCredits = currentSemEnrollments.Sum(e => e.CourseOffering.Subject.Credit);
            response.CurrentSemesterGPA = semCredits > 0 ? Math.Round(semGradeCredit / semCredits, 2) : null;
        }

        // Grade Distribution
        var gradeGroups = enrollments
            .Where(e => !string.IsNullOrEmpty(e.Grade))
            .GroupBy(e => e.Grade!)
            .Select(g => new { Grade = g.Key, Count = g.Count() })
            .ToList();

        var totalGraded = gradeGroups.Sum(g => g.Count);
        var gradeColors = new Dictionary<string, string>
        {
            { "A+", "#10B981" }, { "A", "#34D399" }, { "A-", "#6EE7B7" },
            { "B+", "#3B82F6" }, { "B", "#60A5FA" }, { "B-", "#93C5FD" },
            { "C+", "#F59E0B" }, { "C", "#FBBF24" }, { "C-", "#FCD34D" },
            { "D", "#EF4444" }, { "F", "#DC2626" }
        };

        response.GradeDistribution = gradeGroups.Select(g => new GradeDistributionItem
        {
            Grade = g.Grade,
            Count = g.Count,
            Percentage = totalGraded > 0 ? Math.Round((decimal)g.Count / totalGraded * 100, 1) : 0,
            Color = gradeColors.TryGetValue(g.Grade, out var color) ? color : "#6B7280"
        }).OrderByDescending(g => g.Grade).ToList();

        // Course Grade Details
        response.CourseGrades = enrollments.Select(e =>
        {
            var marks = e.StudentMarks.ToList();
            var totalObtained = marks.Sum(m => m.ObtainedMarks ?? 0);
            var totalMax = marks.Sum(m => m.AssessmentItem.MaxMarks);
            var gradedMarks = marks.Where(m => m.ObtainedMarks.HasValue).ToList();
            var pendingMarks = marks.Where(m => !m.ObtainedMarks.HasValue && !m.IsAbsent).ToList();

            return new CourseGradeDetail
            {
                EnrollmentId = e.Id,
                CourseOfferingId = e.CourseOfferingId,
                SubjectCode = e.CourseOffering.Subject.Code,
                SubjectName = e.CourseOffering.Subject.Name,
                Semester = e.CourseOffering.Subject.Semester ?? 0,
                Credits = e.CourseOffering.Subject.Credit,
                Status = e.Status,
                TotalObtained = totalObtained,
                TotalMaxMarks = totalMax,
                Percentage = totalMax > 0 ? Math.Round(totalObtained / totalMax * 100, 1) : 0,
                Grade = e.Grade,
                GradePoints = e.GradePoints,
                TotalAssessments = marks.Count,
                CompletedAssessments = gradedMarks.Count,
                PendingAssessments = pendingMarks.Count,
                Assessments = marks.Select(m => new AssessmentBreakdown
                {
                    AssessmentItemId = m.AssessmentItemId,
                    Name = m.AssessmentItem.Name,
                    Type = m.AssessmentItem.EvaluationScheme?.EvaluationType ?? "Other",
                    MaxMarks = m.AssessmentItem.MaxMarks,
                    ObtainedMarks = m.ObtainedMarks,
                    Percentage = m.ObtainedMarks.HasValue && m.AssessmentItem.MaxMarks > 0
                        ? Math.Round(m.ObtainedMarks.Value / m.AssessmentItem.MaxMarks * 100, 1)
                        : null,
                    Weight = m.AssessmentItem.Weight,
                    IsGraded = m.ObtainedMarks.HasValue,
                    IsAbsent = m.IsAbsent,
                    GradedDate = m.GradedDate
                }).OrderBy(a => a.Name).ToList()
            };
        }).OrderBy(c => c.Semester).ThenBy(c => c.SubjectCode).ToList();

        // Assessment Type Performance
        var allMarks = enrollments.SelectMany(e => e.StudentMarks).ToList();
        var typeGroups = allMarks
            .Where(m => m.ObtainedMarks.HasValue)
            .GroupBy(m => m.AssessmentItem.EvaluationScheme?.EvaluationType ?? "Other")
            .ToList();

        response.AssessmentTypePerformances = typeGroups.Select(g => new AssessmentTypePerformance
        {
            Type = g.Key,
            Count = g.Count(),
            TotalMaxMarks = g.Sum(m => m.AssessmentItem.MaxMarks),
            TotalObtained = g.Sum(m => m.ObtainedMarks ?? 0),
            AveragePercentage = g.Sum(m => m.AssessmentItem.MaxMarks) > 0
                ? Math.Round(g.Sum(m => m.ObtainedMarks ?? 0) / g.Sum(m => m.AssessmentItem.MaxMarks) * 100, 1)
                : 0
        }).OrderByDescending(t => t.Count).ToList();

        // Semester GPAs for trend chart
        var semesterGroups = completedEnrollments
            .GroupBy(e => e.CourseOffering.Subject.Semester ?? 0)
            .Where(g => g.Key > 0)
            .ToList();

        response.SemesterGPAs = semesterGroups.Select(g =>
        {
            var semGradeCredit = g.Sum(e => (e.GradePoints ?? 0) * e.CourseOffering.Subject.Credit);
            var semCredits = g.Sum(e => e.CourseOffering.Subject.Credit);
            return new SemesterGPAItem
            {
                Semester = g.Key,
                SemesterLabel = $"Sem {g.Key}",
                GPA = semCredits > 0 ? Math.Round(semGradeCredit / semCredits, 2) : null,
                Credits = (int)semCredits,
                CoursesCount = g.Count()
            };
        }).OrderBy(s => s.Semester).ToList();

        // Credit Progress (assuming 160 total credits for now, could be department-specific)
        response.TotalRequiredCredits = 160;
        response.EarnedCredits = (int)response.TotalCreditsEarned;
        response.CreditCompletionPercentage = response.TotalRequiredCredits > 0
            ? Math.Round(response.TotalCreditsEarned / response.TotalRequiredCredits * 100, 1)
            : 0;

        return response;
    }

    /// <summary>
    /// Calculate What-If GPA projections
    /// </summary>
    public async Task<WhatIfCalculatorResponse> CalculateWhatIfAsync(WhatIfCalculatorRequest request)
    {
        var response = new WhatIfCalculatorResponse();

        // Fetch student info
        var student = await _context.Students
            .FirstOrDefaultAsync(s => s.Id == request.StudentId && s.DeletedAt == null);

        if (student == null)
        {
            throw new KeyNotFoundException($"Student with ID {request.StudentId} not found");
        }

        response.CurrentSemester = student.CurrentSemester;

        // Get all enrollments with marks
        var enrollments = await _context.CourseEnrollments
            .Include(ce => ce.CourseOffering)
                .ThenInclude(co => co.Subject)
            .Include(ce => ce.StudentMarks.Where(sm => sm.DeletedAt == null))
                .ThenInclude(sm => sm.AssessmentItem)
            .Where(ce => ce.StudentId == request.StudentId && ce.DeletedAt == null)
            .ToListAsync();

        // Calculate current CGPA
        var completedEnrollments = enrollments.Where(e => e.Status == "Completed" && e.GradePoints.HasValue).ToList();
        if (completedEnrollments.Any())
        {
            var totalGradeCredit = completedEnrollments.Sum(e => (e.GradePoints ?? 0) * e.CourseOffering.Subject.Credit);
            var totalCredits = completedEnrollments.Sum(e => e.CourseOffering.Subject.Credit);
            response.CurrentCGPA = totalCredits > 0 ? Math.Round(totalGradeCredit / totalCredits, 2) : null;
            response.TotalCreditsEarned = totalCredits;
        }

        // Calculate current semester GPA
        var currentSemEnrollments = completedEnrollments
            .Where(e => e.CourseOffering.Subject.Semester == response.CurrentSemester)
            .ToList();
        if (currentSemEnrollments.Any())
        {
            var semGradeCredit = currentSemEnrollments.Sum(e => (e.GradePoints ?? 0) * e.CourseOffering.Subject.Credit);
            var semCredits = currentSemEnrollments.Sum(e => e.CourseOffering.Subject.Credit);
            response.CurrentSemesterGPA = semCredits > 0 ? Math.Round(semGradeCredit / semCredits, 2) : null;
        }

        // Build projections for active enrollments
        var activeEnrollments = enrollments.Where(e => e.Status == "Active").ToList();
        decimal projectedTotalGradeCredit = completedEnrollments.Sum(e => (e.GradePoints ?? 0) * e.CourseOffering.Subject.Credit);
        decimal projectedTotalCredits = response.TotalCreditsEarned;
        decimal projectedSemGradeCredit = 0;
        decimal projectedSemCredits = 0;

        foreach (var enrollment in activeEnrollments)
        {
            var marks = enrollment.StudentMarks.ToList();
            var currentObtained = marks.Sum(m => m.ObtainedMarks ?? 0);
            var currentMax = marks.Where(m => m.ObtainedMarks.HasValue).Sum(m => m.AssessmentItem.MaxMarks);
            var pendingMax = marks.Where(m => !m.ObtainedMarks.HasValue && !m.IsAbsent).Sum(m => m.AssessmentItem.MaxMarks);

            // Apply hypothetical grades for this enrollment
            var hypotheticalForEnrollment = request.HypotheticalGrades
                .Where(h => h.EnrollmentId == enrollment.Id)
                .ToList();

            decimal hypotheticalObtained = 0;
            decimal hypotheticalMax = 0;
            foreach (var hypo in hypotheticalForEnrollment)
            {
                hypotheticalObtained += hypo.ObtainedMarks;
                hypotheticalMax += hypo.MaxMarks;
            }

            // Calculate projected percentage
            var projectedObtained = currentObtained + hypotheticalObtained;
            var projectedMax = currentMax + hypotheticalMax;
            var currentPercentage = currentMax > 0 ? Math.Round(currentObtained / currentMax * 100, 1) : 0;
            var projectedPercentage = projectedMax > 0 ? Math.Round(projectedObtained / projectedMax * 100, 1) : currentPercentage;

            // Convert to grade
            var projectedGrade = GradePointScale.GetGradeFromPercentage(projectedPercentage);
            var projectedGradePoints = GradePointScale.GetGradePointsFromPercentage(projectedPercentage);

            var projection = new CourseProjection
            {
                EnrollmentId = enrollment.Id,
                CourseOfferingId = enrollment.CourseOfferingId,
                SubjectCode = enrollment.CourseOffering.Subject.Code,
                SubjectName = enrollment.CourseOffering.Subject.Name,
                Credits = enrollment.CourseOffering.Subject.Credit,
                CurrentPercentage = currentPercentage,
                CurrentGrade = currentMax > 0 ? GradePointScale.GetGradeFromPercentage(currentPercentage) : null,
                CurrentGradePoints = currentMax > 0 ? GradePointScale.GetGradePointsFromPercentage(currentPercentage) : null,
                ProjectedPercentage = projectedPercentage,
                ProjectedGrade = projectedGrade,
                ProjectedGradePoints = projectedGradePoints,
                PendingAssessments = marks.Count(m => !m.ObtainedMarks.HasValue && !m.IsAbsent),
                PendingMaxMarks = pendingMax
            };

            response.CourseProjections.Add(projection);

            // Add to projections
            projectedTotalGradeCredit += projectedGradePoints * enrollment.CourseOffering.Subject.Credit;
            projectedTotalCredits += enrollment.CourseOffering.Subject.Credit;

            if (enrollment.CourseOffering.Subject.Semester == response.CurrentSemester)
            {
                projectedSemGradeCredit += projectedGradePoints * enrollment.CourseOffering.Subject.Credit;
                projectedSemCredits += enrollment.CourseOffering.Subject.Credit;
            }
        }

        // Also handle hypothetical course grades directly
        foreach (var hypo in request.HypotheticalCourseGrades)
        {
            projectedTotalGradeCredit += hypo.GradePoints * hypo.Credits;
            projectedTotalCredits += hypo.Credits;
        }

        // Calculate projected GPAs
        response.ProjectedCGPA = projectedTotalCredits > 0 ? Math.Round(projectedTotalGradeCredit / projectedTotalCredits, 2) : null;
        response.ProjectedCredits = projectedTotalCredits;

        var totalSemCredits = projectedSemCredits + currentSemEnrollments.Sum(e => e.CourseOffering.Subject.Credit);
        var totalSemGradeCredit = projectedSemGradeCredit + currentSemEnrollments.Sum(e => (e.GradePoints ?? 0) * e.CourseOffering.Subject.Credit);
        response.ProjectedSemesterGPA = totalSemCredits > 0 ? Math.Round(totalSemGradeCredit / totalSemCredits, 2) : null;

        // Calculate changes
        response.CGPAChange = response.ProjectedCGPA.HasValue && response.CurrentCGPA.HasValue
            ? response.ProjectedCGPA.Value - response.CurrentCGPA.Value
            : null;
        response.SemesterGPAChange = response.ProjectedSemesterGPA.HasValue && response.CurrentSemesterGPA.HasValue
            ? response.ProjectedSemesterGPA.Value - response.CurrentSemesterGPA.Value
            : null;

        // Determine impact level
        if (response.CGPAChange.HasValue)
        {
            response.ImpactLevel = response.CGPAChange.Value > 0.1m ? "Positive" :
                                   response.CGPAChange.Value < -0.1m ? "Negative" : "Neutral";
        }
        else
        {
            response.ImpactLevel = "Neutral";
        }

        // Calculate target requirements for active courses
        foreach (var projection in response.CourseProjections.Where(p => p.PendingAssessments > 0))
        {
            var enrollment = activeEnrollments.First(e => e.Id == projection.EnrollmentId);
            var marks = enrollment.StudentMarks.ToList();
            var currentObtained = marks.Sum(m => m.ObtainedMarks ?? 0);
            var currentMax = marks.Where(m => m.ObtainedMarks.HasValue).Sum(m => m.AssessmentItem.MaxMarks);
            var pendingMax = marks.Where(m => !m.ObtainedMarks.HasValue && !m.IsAbsent).Sum(m => m.AssessmentItem.MaxMarks);
            var totalMax = marks.Sum(m => m.AssessmentItem.MaxMarks);

            // Calculate what's needed for various target grades
            foreach (var targetGrade in new[] { "A", "B+", "B" })
            {
                var targetPercentage = GradePointScale.GetMinPercentageForGrade(targetGrade);
                var targetTotal = totalMax * targetPercentage / 100;
                var neededInRemaining = targetTotal - currentObtained;
                var neededPercentage = pendingMax > 0 ? Math.Round(neededInRemaining / pendingMax * 100, 1) : 0;

                var isAchievable = neededPercentage <= 100;
                var message = isAchievable
                    ? $"Score {neededPercentage}% in remaining assessments"
                    : $"Target grade is not achievable with remaining assessments";

                response.TargetRequirements.Add(new TargetGradeRequirement
                {
                    EnrollmentId = projection.EnrollmentId,
                    SubjectCode = projection.SubjectCode,
                    SubjectName = projection.SubjectName,
                    CurrentPercentage = projection.CurrentPercentage ?? 0,
                    RequiredPercentageInRemaining = neededPercentage,
                    TargetGrade = targetGrade,
                    IsAchievable = isAchievable,
                    Message = message
                });
            }
        }

        return response;
    }

    #endregion

    #region Enhanced Analytics

    public async Task<EnhancedAnalyticsResponse> GetEnhancedAnalyticsAsync(EnhancedAnalyticsRequest request, int? facultyScopeId = null)
    {
        var fromDate = request.FromDate ?? DateTime.UtcNow.AddMonths(-12);
        var toDate = request.ToDate ?? DateTime.UtcNow;

        var baseQuery = _context.StudentMarks
            .Include(sm => sm.Enrollment)
                .ThenInclude(e => e.CourseOffering)
                    .ThenInclude(co => co.Batch)
            .Include(sm => sm.Enrollment)
                .ThenInclude(e => e.CourseOffering)
                    .ThenInclude(co => co.Subject)
            .Include(sm => sm.AssessmentItem)
            .Include(sm => sm.Enrollment)
                .ThenInclude(e => e.CourseOffering)
                    .ThenInclude(co => co.FacultyAssignments)
            .Where(sm => sm.DeletedAt == null
                && sm.Enrollment.DeletedAt == null
                && sm.Enrollment.CourseOffering.DeletedAt == null
                && sm.AssessmentItem != null
                && sm.ObtainedMarks != null
                && sm.IsAbsent != true);

        baseQuery = baseQuery.Where(sm =>
            (sm.GradedDate ?? sm.CreatedAt) >= fromDate &&
            (sm.GradedDate ?? sm.CreatedAt) <= toDate);

        if (request.SubjectId.HasValue)
        {
            baseQuery = baseQuery.Where(sm => sm.Enrollment.CourseOffering.SubjectId == request.SubjectId.Value);
        }

        if (request.BatchId.HasValue)
        {
            baseQuery = baseQuery.Where(sm => sm.Enrollment.CourseOffering.BatchId == request.BatchId.Value);
        }

        if (request.CourseOfferingId.HasValue)
        {
            baseQuery = baseQuery.Where(sm => sm.Enrollment.CourseOfferingId == request.CourseOfferingId.Value);
        }

        var scopedFacultyId = facultyScopeId ?? request.FacultyId;
        if (scopedFacultyId.HasValue)
        {
            baseQuery = baseQuery.Where(sm => sm.Enrollment.CourseOffering.FacultyAssignments
                .Any(fa => fa.DeletedAt == null && fa.FacultyId == scopedFacultyId.Value));
        }

        var records = await baseQuery
            .Select(sm => new
            {
                BatchId = sm.Enrollment.CourseOffering.BatchId,
                BatchName = sm.Enrollment.CourseOffering.Batch.Name,
                sm.Enrollment.CourseOfferingId,
                SubjectCode = sm.Enrollment.CourseOffering.Subject.Code,
                SubjectName = sm.Enrollment.CourseOffering.Subject.Name,
                AssessmentItemId = sm.AssessmentItemId,
                StudentId = sm.Enrollment.StudentId,
                Percentage = sm.AssessmentItem.MaxMarks > 0
                    ? Math.Round((decimal)(sm.ObtainedMarks ?? 0) / sm.AssessmentItem.MaxMarks * 100, 2)
                    : 0,
                GradedOn = sm.GradedDate ?? sm.CreatedAt
            })
            .ToListAsync();

        var response = new EnhancedAnalyticsResponse();

        if (!records.Any())
        {
            return response;
        }

        response.CrossBatchPerformance = records
            .GroupBy(r => new { r.BatchId, r.BatchName, r.CourseOfferingId, r.SubjectCode, r.SubjectName })
            .Select(g =>
            {
                var ordered = g.Select(x => x.Percentage).OrderBy(x => x).ToList();
                var count = ordered.Count;
                decimal median;
                if (count == 0)
                {
                    median = 0;
                }
                else if (count % 2 == 1)
                {
                    median = ordered[count / 2];
                }
                else
                {
                    median = (ordered[(count / 2) - 1] + ordered[count / 2]) / 2;
                }

                return new CrossBatchPerformanceItem
                {
                    BatchId = g.Key.BatchId,
                    BatchName = g.Key.BatchName ?? "Unknown Batch",
                    CourseOfferingId = g.Key.CourseOfferingId,
                    SubjectCode = g.Key.SubjectCode,
                    SubjectName = g.Key.SubjectName,
                    AveragePercentage = Math.Round(g.Average(x => x.Percentage), 2),
                    MedianPercentage = Math.Round(median, 2),
                    StudentCount = g.Select(x => x.StudentId).Distinct().Count(),
                    AssessmentCount = g.Select(x => x.AssessmentItemId).Distinct().Count()
                };
            })
            .Where(x => x.StudentCount >= request.MinStudents)
            .OrderByDescending(x => x.AveragePercentage)
            .ToList();

        response.GradeDistributions = records
            .GroupBy(r => new { r.BatchId, r.BatchName, r.CourseOfferingId, r.SubjectCode })
            .Select(g =>
            {
                var total = g.Count();
                var values = g.Select(x => x.Percentage).ToList();

                return new GradeDistributionSeries
                {
                    Label = !string.IsNullOrWhiteSpace(g.Key.BatchName) ? g.Key.BatchName : "Batch",
                    BatchId = g.Key.BatchId,
                    CourseOfferingId = g.Key.CourseOfferingId,
                    Buckets = new List<GradeBucket>
                    {
                        BuildBucket("A", values, total, p => p >= 85),
                        BuildBucket("B", values, total, p => p >= 70 && p < 85),
                        BuildBucket("C", values, total, p => p >= 55 && p < 70),
                        BuildBucket("D", values, total, p => p >= 40 && p < 55),
                        BuildBucket("F", values, total, p => p < 40)
                    }
                };
            })
            .ToList();

        response.GradeTrends = records
            .GroupBy(r => new { r.GradedOn.Year, r.GradedOn.Month })
            .Select(g => new GradeTrendPoint
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Label = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("yyyy-MM"),
                AveragePercentage = Math.Round(g.Average(x => x.Percentage), 2),
                SampleSize = g.Count()
            })
            .OrderBy(t => t.Year)
            .ThenBy(t => t.Month)
            .ToList();

        return response;
    }

    private static GradeBucket BuildBucket(string grade, IEnumerable<decimal> values, int total, Func<decimal, bool> predicate)
    {
        var count = values.Count(predicate);
        var percentage = total > 0 ? Math.Round((decimal)count / total * 100, 2) : 0;
        return new GradeBucket
        {
            Grade = grade,
            Count = count,
            Percentage = percentage
        };
    }

    #endregion
}
