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
                SubjectCode = co.Subject.Code,
                SubjectName = co.Subject.Name,
                BatchName = co.Batch.Name,
                AcademicYear = co.AcademicYear,
                EnrolledStudents = enrolledStudents.Count,
                PendingGrades = Math.Max(0, pendingGrades),
                AverageScore = avgScore,
                AverageAttendance = avgAttendance,
                IsCoordinator = co.SubjectCoordinatorId == facultyId
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
}
