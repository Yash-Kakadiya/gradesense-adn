using GradeSense.API.DTOs.AttendanceRecord.Request;
using GradeSense.API.DTOs.CourseEnrollment.Request;
using GradeSense.API.DTOs.Export;
using GradeSense.API.DTOs.FacultyAssignment.Request;
using GradeSense.API.DTOs.StudentMark.Request;
using GradeSense.API.Helpers;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services;

/// <summary>
/// Service implementation for faculty-specific data export functionality.
/// Allows faculty to export student data for their assigned courses.
/// </summary>
public class FacultyExportService : IFacultyExportService
{
    private readonly IFacultyRepository _facultyRepository;
    private readonly IFacultyAssignmentRepository _facultyAssignmentRepository;
    private readonly ICourseOfferingRepository _courseOfferingRepository;
    private readonly ICourseEnrollmentRepository _courseEnrollmentRepository;
    private readonly IStudentMarkRepository _studentMarkRepository;
    private readonly IAttendanceRecordRepository _attendanceRecordRepository;
    private readonly IAssessmentItemRepository _assessmentItemRepository;
    private readonly ILogger<FacultyExportService> _logger;

    public FacultyExportService(
        IFacultyRepository facultyRepository,
        IFacultyAssignmentRepository facultyAssignmentRepository,
        ICourseOfferingRepository courseOfferingRepository,
        ICourseEnrollmentRepository courseEnrollmentRepository,
        IStudentMarkRepository studentMarkRepository,
        IAttendanceRecordRepository attendanceRecordRepository,
        IAssessmentItemRepository assessmentItemRepository,
        ILogger<FacultyExportService> logger)
    {
        _facultyRepository = facultyRepository;
        _facultyAssignmentRepository = facultyAssignmentRepository;
        _courseOfferingRepository = courseOfferingRepository;
        _courseEnrollmentRepository = courseEnrollmentRepository;
        _studentMarkRepository = studentMarkRepository;
        _attendanceRecordRepository = attendanceRecordRepository;
        _assessmentItemRepository = assessmentItemRepository;
        _logger = logger;
    }

    #region Validation

    public async Task<bool> ValidateFacultyAccessAsync(int facultyId, int courseOfferingId)
    {
        var filter = new FacultyAssignmentFilterRequest
        {
            FacultyId = facultyId,
            CourseOfferingId = courseOfferingId,
            PageSize = 1
        };

        var (assignments, count) = await _facultyAssignmentRepository.GetAllAsync(filter);
        return count > 0;
    }

    private async Task EnsureFacultyAccessAsync(int facultyId, int courseOfferingId)
    {
        var hasAccess = await ValidateFacultyAccessAsync(facultyId, courseOfferingId);
        if (!hasAccess)
        {
            throw new UnauthorizedAccessException($"Faculty {facultyId} does not have access to course offering {courseOfferingId}");
        }
    }

    #endregion

    #region Student Roster Exports

    public async Task<byte[]> ExportStudentRosterToCsvAsync(int facultyId, FacultyRosterExportRequest request)
    {
        _logger.LogInformation("Exporting student roster to CSV for faculty {FacultyId}, course {CourseOfferingId}",
            facultyId, request.CourseOfferingId);

        await EnsureFacultyAccessAsync(facultyId, request.CourseOfferingId);

        var enrollments = await GetCourseEnrollmentsAsync(request.CourseOfferingId, request.Status);

        var exportData = enrollments.Select(e => new StudentRosterCsvExport
        {
            EnrollmentNumber = e.Student.EnrollmentNumber,
            StudentName = e.Student.IdNavigation.FullName,
            Email = e.Student.IdNavigation.PersonalEmail ?? "",
            BatchName = e.CourseOffering.Batch?.Name ?? "N/A",
            Semester = e.Student.CurrentSemester,
            EnrollmentStatus = e.Status
        }).OrderBy(s => s.EnrollmentNumber).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportStudentRosterToExcelAsync(int facultyId, FacultyRosterExportRequest request)
    {
        _logger.LogInformation("Exporting student roster to Excel for faculty {FacultyId}, course {CourseOfferingId}",
            facultyId, request.CourseOfferingId);

        await EnsureFacultyAccessAsync(facultyId, request.CourseOfferingId);

        var courseOffering = await _courseOfferingRepository.GetByIdAsync(request.CourseOfferingId);
        if (courseOffering == null)
        {
            throw new ArgumentException($"Course offering {request.CourseOfferingId} not found");
        }

        var faculty = await _facultyRepository.GetByIdAsync(facultyId);
        var enrollments = await GetCourseEnrollmentsAsync(request.CourseOfferingId, request.Status);

        // Calculate attendance and grades for each student
        var exportData = new List<StudentRosterExcelExport>();
        foreach (var enrollment in enrollments)
        {
            var attendanceStats = await GetStudentAttendanceStatsAsync(enrollment.Student.Id, request.CourseOfferingId);
            var gradeStats = await GetStudentGradeStatsAsync(enrollment.Student.Id, request.CourseOfferingId);

            exportData.Add(new StudentRosterExcelExport
            {
                EnrollmentNumber = enrollment.Student.EnrollmentNumber,
                StudentName = enrollment.Student.IdNavigation.FullName,
                Email = enrollment.Student.IdNavigation.PersonalEmail ?? "",
                Phone = enrollment.Student.IdNavigation.PhoneNumber ?? "",
                BatchName = courseOffering.Batch?.Name ?? "N/A",
                Semester = enrollment.Student.CurrentSemester,
                DepartmentName = enrollment.Student.Department?.Name ?? "N/A",
                CurrentCGPA = enrollment.Student.Cgpa,
                AttendancePercentage = attendanceStats.Percentage,
                CurrentGradePercentage = gradeStats.Percentage,
                EnrollmentStatus = enrollment.Status,
                RiskStatus = DetermineRiskStatus(attendanceStats.Percentage, gradeStats.Percentage),
                EnrolledDate = enrollment.EnrollmentDate ?? DateTime.MinValue
            });
        }

        // Create header info
        var headerInfo = new CourseRosterHeaderInfo
        {
            SubjectCode = courseOffering.Subject?.Code ?? "",
            SubjectName = courseOffering.Subject?.Name ?? "",
            Credits = (int)(courseOffering.Subject?.Credit ?? 0),
            Semester = courseOffering.Subject?.Semester ?? 0,
            BatchName = courseOffering.Batch?.Name ?? "N/A",
            AcademicYear = $"{courseOffering.AcademicYear}-{courseOffering.AcademicYear + 1}",
            FacultyName = faculty?.IdNavigation.FullName ?? "N/A",
            TotalStudents = enrollments.Count,
            GeneratedDate = DateTime.Now
        };

        return GenerateRosterExcel(headerInfo, exportData.OrderBy(s => s.EnrollmentNumber).ToList());
    }

    #endregion

    #region Grades Exports

    public async Task<byte[]> ExportGradesToCsvAsync(int facultyId, FacultyGradesExportRequest request)
    {
        _logger.LogInformation("Exporting grades to CSV for faculty {FacultyId}, course {CourseOfferingId}",
            facultyId, request.CourseOfferingId);

        await EnsureFacultyAccessAsync(facultyId, request.CourseOfferingId);

        var marks = await GetCourseMarksAsync(request.CourseOfferingId, request.AssessmentItemId);

        var exportData = marks.Select(m => new FacultyGradesCsvExport
        {
            EnrollmentNumber = m.Enrollment.Student.EnrollmentNumber,
            StudentName = m.Enrollment.Student.IdNavigation.FullName,
            AssessmentName = m.AssessmentItem.Name,
            MaxMarks = m.AssessmentItem.MaxMarks,
            ObtainedMarks = m.IsAbsent ? "Absent" : (m.ObtainedMarks?.ToString("F2") ?? "Pending"),
            Percentage = CalculateMarkPercentageString(m),
            Status = GetMarkStatus(m)
        }).OrderBy(g => g.EnrollmentNumber).ThenBy(g => g.AssessmentName).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportGradesToExcelAsync(int facultyId, FacultyGradesExportRequest request)
    {
        _logger.LogInformation("Exporting grades to Excel for faculty {FacultyId}, course {CourseOfferingId}",
            facultyId, request.CourseOfferingId);

        await EnsureFacultyAccessAsync(facultyId, request.CourseOfferingId);

        var courseOffering = await _courseOfferingRepository.GetByIdAsync(request.CourseOfferingId);
        if (courseOffering == null)
        {
            throw new ArgumentException($"Course offering {request.CourseOfferingId} not found");
        }

        var faculty = await _facultyRepository.GetByIdAsync(facultyId);
        var marks = await GetCourseMarksAsync(request.CourseOfferingId, request.AssessmentItemId);
        var enrollments = await GetCourseEnrollmentsAsync(request.CourseOfferingId, null);

        // Build export data
        var exportData = marks.Select(m => new FacultyGradesExcelExport
        {
            EnrollmentNumber = m.Enrollment.Student.EnrollmentNumber,
            StudentName = m.Enrollment.Student.IdNavigation.FullName,
            AssessmentName = m.AssessmentItem.Name,
            AssessmentType = m.AssessmentItem.EvaluationScheme?.EvaluationType ?? "N/A",
            MaxMarks = m.AssessmentItem.MaxMarks,
            ObtainedMarks = m.IsAbsent ? null : m.ObtainedMarks,
            Percentage = m.IsAbsent || !m.ObtainedMarks.HasValue ? null :
                Math.Round(m.ObtainedMarks.Value / m.AssessmentItem.MaxMarks * 100, 2),
            WeightedScore = m.IsAbsent || !m.ObtainedMarks.HasValue || m.AssessmentItem.Weight == null ? null :
                Math.Round(m.ObtainedMarks.Value / m.AssessmentItem.MaxMarks * m.AssessmentItem.Weight.Value, 2),
            IsAbsent = m.IsAbsent,
            Status = GetMarkStatus(m),
            GradedDate = m.GradedDate,
            GradedBy = m.Grader?.IdNavigation.FullName ?? "N/A"
        }).OrderBy(g => g.EnrollmentNumber).ThenBy(g => g.AssessmentName).ToList();

        // Calculate statistics
        var gradedMarks = marks.Where(m => !m.IsAbsent && m.ObtainedMarks.HasValue).ToList();
        var percentages = gradedMarks.Select(m => m.ObtainedMarks!.Value / m.AssessmentItem.MaxMarks * 100).ToList();

        var headerInfo = new FacultyGradesHeaderInfo
        {
            SubjectCode = courseOffering.Subject?.Code ?? "",
            SubjectName = courseOffering.Subject?.Name ?? "",
            Credits = (int)(courseOffering.Subject?.Credit ?? 0),
            Semester = courseOffering.Subject?.Semester ?? 0,
            BatchName = courseOffering.Batch?.Name ?? "N/A",
            AcademicYear = $"{courseOffering.AcademicYear}-{courseOffering.AcademicYear + 1}",
            FacultyName = faculty?.IdNavigation.FullName ?? "N/A",
            TotalStudents = enrollments.Count,
            AssessmentsCount = marks.Select(m => m.AssessmentItemId).Distinct().Count(),
            ClassAverage = percentages.Any() ? Math.Round((decimal)percentages.Average(), 2) : 0,
            HighestScore = percentages.Any() ? Math.Round((decimal)percentages.Max(), 2) : 0,
            LowestScore = percentages.Any() ? Math.Round((decimal)percentages.Min(), 2) : 0,
            GeneratedDate = DateTime.Now
        };

        // Build student summary (one row per student with total score)
        var studentSummary = enrollments.Select(e =>
        {
            var studentMarks = marks.Where(m => m.Enrollment.StudentId == e.Student.Id).ToList();
            var totalObtained = studentMarks.Where(m => !m.IsAbsent && m.ObtainedMarks.HasValue)
                .Sum(m => m.ObtainedMarks!.Value);
            var totalMax = studentMarks.Sum(m => m.AssessmentItem.MaxMarks);
            var percentage = totalMax > 0 ? Math.Round(totalObtained / totalMax * 100, 2) : 0;

            return new
            {
                EnrollmentNumber = e.Student.EnrollmentNumber,
                StudentName = e.Student.IdNavigation.FullName,
                TotalObtained = totalObtained,
                TotalMaxMarks = totalMax,
                Percentage = percentage,
                Grade = e.Grade ?? CalculateGrade(percentage),
                Status = e.Status
            };
        }).OrderBy(s => s.EnrollmentNumber).ToList();

        return GenerateGradesExcel(headerInfo, exportData, studentSummary);
    }

    public async Task<byte[]> ExportAssessmentGradesAsync(int facultyId, int assessmentItemId)
    {
        _logger.LogInformation("Exporting assessment grades for faculty {FacultyId}, assessment {AssessmentItemId}",
            facultyId, assessmentItemId);

        var assessment = await _assessmentItemRepository.GetByIdAsync(assessmentItemId);
        if (assessment == null)
        {
            throw new ArgumentException($"Assessment item {assessmentItemId} not found");
        }

        await EnsureFacultyAccessAsync(facultyId, assessment.EvaluationScheme.CourseOfferingId);

        var marks = await GetCourseMarksAsync(assessment.EvaluationScheme.CourseOfferingId, assessmentItemId);

        var exportData = marks.Select(m => new AssessmentGradesExport
        {
            EnrollmentNumber = m.Enrollment.Student.EnrollmentNumber,
            StudentName = m.Enrollment.Student.IdNavigation.FullName,
            MaxMarks = m.AssessmentItem.MaxMarks,
            ObtainedMarks = m.IsAbsent ? null : m.ObtainedMarks,
            Percentage = m.IsAbsent || !m.ObtainedMarks.HasValue ? null :
                Math.Round(m.ObtainedMarks.Value / m.AssessmentItem.MaxMarks * 100, 2),
            IsAbsent = m.IsAbsent,
            Status = GetMarkStatus(m)
        }).OrderBy(g => g.EnrollmentNumber).ToList();

        var sheets = new Dictionary<string, object>
        {
            {
                "Assessment Info", new List<object>
                {
                    new { Field = "Assessment Name", Value = assessment.Name },
                    new { Field = "Assessment Type", Value = assessment.EvaluationScheme?.EvaluationType ?? "N/A" },
                    new { Field = "Max Marks", Value = assessment.MaxMarks.ToString() },
                    new { Field = "Weight (%)", Value = assessment.Weight?.ToString() ?? "N/A" },
                    new { Field = "Due Date", Value = assessment.DueDate?.ToString("dd-MMM-yyyy") ?? "N/A" },
                    new { Field = "Generated Date", Value = DateTime.Now.ToString("dd-MMM-yyyy HH:mm") }
                }
            },
            { "Grades", exportData }
        };

        return ExcelHelperService.GenerateExcelWithMultipleSheets(sheets);
    }

    #endregion

    #region Attendance Exports

    public async Task<byte[]> ExportAttendanceToCsvAsync(int facultyId, FacultyAttendanceExportRequest request)
    {
        _logger.LogInformation("Exporting attendance to CSV for faculty {FacultyId}, course {CourseOfferingId}",
            facultyId, request.CourseOfferingId);

        await EnsureFacultyAccessAsync(facultyId, request.CourseOfferingId);

        var attendance = await GetCourseAttendanceAsync(request.CourseOfferingId, request.FromDate, request.ToDate);

        var exportData = attendance.Select(a => new FacultyAttendanceCsvExport
        {
            Date = a.AttendanceDate.ToString("yyyy-MM-dd"),
            EnrollmentNumber = a.Enrollment.Student.EnrollmentNumber,
            StudentName = a.Enrollment.Student.IdNavigation.FullName,
            Status = a.Status,
            Remarks = a.Remarks ?? ""
        }).OrderByDescending(a => a.Date).ThenBy(a => a.EnrollmentNumber).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportAttendanceToExcelAsync(int facultyId, FacultyAttendanceExportRequest request)
    {
        _logger.LogInformation("Exporting attendance to Excel for faculty {FacultyId}, course {CourseOfferingId}",
            facultyId, request.CourseOfferingId);

        await EnsureFacultyAccessAsync(facultyId, request.CourseOfferingId);

        var courseOffering = await _courseOfferingRepository.GetByIdAsync(request.CourseOfferingId);
        if (courseOffering == null)
        {
            throw new ArgumentException($"Course offering {request.CourseOfferingId} not found");
        }

        var faculty = await _facultyRepository.GetByIdAsync(facultyId);
        var attendance = await GetCourseAttendanceAsync(request.CourseOfferingId, request.FromDate, request.ToDate);
        var enrollments = await GetCourseEnrollmentsAsync(request.CourseOfferingId, null);

        // Calculate summary per student
        var summaryData = enrollments.Select(e =>
        {
            var studentAttendance = attendance.Where(a => a.Enrollment.StudentId == e.Student.Id).ToList();
            var totalClasses = studentAttendance.Count;
            var present = studentAttendance.Count(a => a.Status == "Present");
            var absent = studentAttendance.Count(a => a.Status == "Absent");
            var late = studentAttendance.Count(a => a.Status == "Late");
            var percentage = totalClasses > 0 ? Math.Round((decimal)(present + late) / totalClasses * 100, 2) : 100;

            return new StudentAttendanceSummaryExport
            {
                EnrollmentNumber = e.Student.EnrollmentNumber,
                StudentName = e.Student.IdNavigation.FullName,
                TotalClasses = totalClasses,
                Present = present,
                Absent = absent,
                Late = late,
                AttendancePercentage = percentage,
                Status = percentage >= 75 ? "Good" : percentage >= 60 ? "Warning" : "Critical"
            };
        }).OrderBy(s => s.EnrollmentNumber).ToList();

        // Detailed records
        var detailedData = attendance.Select(a => new FacultyAttendanceExcelExport
        {
            Date = a.AttendanceDate.ToDateTime(TimeOnly.MinValue),
            Day = a.AttendanceDate.DayOfWeek.ToString(),
            EnrollmentNumber = a.Enrollment.Student.EnrollmentNumber,
            StudentName = a.Enrollment.Student.IdNavigation.FullName,
            Status = a.Status,
            Remarks = a.Remarks ?? "",
            RecordedBy = a.RecordedByNavigation?.IdNavigation.FullName ?? "N/A"
        }).OrderByDescending(a => a.Date).ThenBy(a => a.EnrollmentNumber).ToList();

        // Calculate overall stats
        var totalClassesConducted = attendance.Select(a => a.AttendanceDate).Distinct().Count();
        var overallAttendance = summaryData.Any()
            ? Math.Round(summaryData.Average(s => s.AttendancePercentage), 2)
            : 100;

        var headerInfo = new FacultyAttendanceHeaderInfo
        {
            SubjectCode = courseOffering.Subject?.Code ?? "",
            SubjectName = courseOffering.Subject?.Name ?? "",
            BatchName = courseOffering.Batch?.Name ?? "N/A",
            Semester = courseOffering.Subject?.Semester ?? 0,
            AcademicYear = $"{courseOffering.AcademicYear}-{courseOffering.AcademicYear + 1}",
            FacultyName = faculty?.IdNavigation.FullName ?? "N/A",
            TotalStudents = enrollments.Count,
            TotalClasses = totalClassesConducted,
            ClassAverageAttendance = overallAttendance,
            FromDate = request.FromDate,
            ToDate = request.ToDate,
            GeneratedDate = DateTime.Now
        };

        return GenerateAttendanceExcel(headerInfo, summaryData, detailedData);
    }

    #endregion

    #region At-Risk Students Export

    public async Task<byte[]> ExportAtRiskStudentsToCsvAsync(int facultyId, FacultyAtRiskExportRequest request)
    {
        _logger.LogInformation("Exporting at-risk students to CSV for faculty {FacultyId}, course {CourseOfferingId}",
            facultyId, request.CourseOfferingId);

        await EnsureFacultyAccessAsync(facultyId, request.CourseOfferingId);

        var atRiskStudents = await GetAtRiskStudentsAsync(request.CourseOfferingId, request.RiskLevel);

        var exportData = atRiskStudents.Select(s => new AtRiskStudentCsvExport
        {
            EnrollmentNumber = s.EnrollmentNumber,
            StudentName = s.StudentName,
            RiskLevel = s.RiskLevel,
            AttendancePercentage = s.AttendancePercentage,
            GradePercentage = s.GradePercentage,
            PrimaryRiskFactor = s.PrimaryRiskFactor
        }).OrderBy(s => s.RiskLevel).ThenBy(s => s.EnrollmentNumber).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportAtRiskStudentsToExcelAsync(int facultyId, FacultyAtRiskExportRequest request)
    {
        _logger.LogInformation("Exporting at-risk students to Excel for faculty {FacultyId}, course {CourseOfferingId}",
            facultyId, request.CourseOfferingId);

        await EnsureFacultyAccessAsync(facultyId, request.CourseOfferingId);

        var courseOffering = await _courseOfferingRepository.GetByIdAsync(request.CourseOfferingId);
        if (courseOffering == null)
        {
            throw new ArgumentException($"Course offering {request.CourseOfferingId} not found");
        }

        var faculty = await _facultyRepository.GetByIdAsync(facultyId);
        var atRiskStudents = await GetAtRiskStudentsAsync(request.CourseOfferingId, request.RiskLevel);
        var enrollments = await GetCourseEnrollmentsAsync(request.CourseOfferingId, null);

        var headerInfo = new AtRiskReportHeaderInfo
        {
            SubjectCode = courseOffering.Subject?.Code ?? "",
            SubjectName = courseOffering.Subject?.Name ?? "",
            BatchName = courseOffering.Batch?.Name ?? "N/A",
            AcademicYear = $"{courseOffering.AcademicYear}-{courseOffering.AcademicYear + 1}",
            FacultyName = faculty?.IdNavigation.FullName ?? "N/A",
            TotalStudents = enrollments.Count,
            AtRiskCount = atRiskStudents.Count,
            HighRiskCount = atRiskStudents.Count(s => s.RiskLevel == "High"),
            MediumRiskCount = atRiskStudents.Count(s => s.RiskLevel == "Medium"),
            LowRiskCount = atRiskStudents.Count(s => s.RiskLevel == "Low"),
            GeneratedDate = DateTime.Now
        };

        var sheets = new Dictionary<string, object>
        {
            {
                "Report Info", new List<object>
                {
                    new { Field = "Subject Code", Value = headerInfo.SubjectCode },
                    new { Field = "Subject Name", Value = headerInfo.SubjectName },
                    new { Field = "Batch", Value = headerInfo.BatchName },
                    new { Field = "Academic Year", Value = headerInfo.AcademicYear },
                    new { Field = "Faculty", Value = headerInfo.FacultyName },
                    new { Field = "Total Students", Value = headerInfo.TotalStudents.ToString() },
                    new { Field = "At-Risk Students", Value = headerInfo.AtRiskCount.ToString() },
                    new { Field = "High Risk", Value = headerInfo.HighRiskCount.ToString() },
                    new { Field = "Medium Risk", Value = headerInfo.MediumRiskCount.ToString() },
                    new { Field = "Low Risk", Value = headerInfo.LowRiskCount.ToString() },
                    new { Field = "Generated Date", Value = headerInfo.GeneratedDate.ToString("dd-MMM-yyyy HH:mm") }
                }
            },
            { "At-Risk Students", atRiskStudents.OrderBy(s => s.RiskLevel).ThenBy(s => s.EnrollmentNumber).ToList() }
        };

        return ExcelHelperService.GenerateExcelWithMultipleSheets(sheets);
    }

    #endregion

    #region Comprehensive Reports

    public async Task<byte[]> ExportCourseReportAsync(int facultyId, int courseOfferingId)
    {
        _logger.LogInformation("Exporting comprehensive course report for faculty {FacultyId}, course {CourseOfferingId}",
            facultyId, courseOfferingId);

        await EnsureFacultyAccessAsync(facultyId, courseOfferingId);

        var courseOffering = await _courseOfferingRepository.GetByIdAsync(courseOfferingId);
        if (courseOffering == null)
        {
            throw new ArgumentException($"Course offering {courseOfferingId} not found");
        }

        var faculty = await _facultyRepository.GetByIdAsync(facultyId);
        var enrollments = await GetCourseEnrollmentsAsync(courseOfferingId, null);
        var marks = await GetCourseMarksAsync(courseOfferingId, null);
        var attendance = await GetCourseAttendanceAsync(courseOfferingId, null, null);

        var sheets = new Dictionary<string, object>();

        // Course Info Sheet
        sheets.Add("Course Info", new List<object>
        {
            new { Field = "Subject Code", Value = courseOffering.Subject?.Code ?? "" },
            new { Field = "Subject Name", Value = courseOffering.Subject?.Name ?? "" },
            new { Field = "Credits", Value = courseOffering.Subject?.Credit.ToString() ?? "0" },
            new { Field = "Semester", Value = courseOffering.Subject?.Semester.ToString() ?? "0" },
            new { Field = "Batch", Value = courseOffering.Batch?.Name ?? "N/A" },
            new { Field = "Academic Year", Value = $"{courseOffering.AcademicYear}-{courseOffering.AcademicYear + 1}" },
            new { Field = "Faculty", Value = faculty?.IdNavigation.FullName ?? "N/A" },
            new { Field = "Total Students", Value = enrollments.Count.ToString() },
            new { Field = "Report Generated", Value = DateTime.Now.ToString("dd-MMM-yyyy HH:mm") }
        });

        // Student Roster
        var rosterData = enrollments.Select(e => new
        {
            EnrollmentNumber = e.Student.EnrollmentNumber,
            StudentName = e.Student.IdNavigation.FullName,
            Email = e.Student.IdNavigation.PersonalEmail ?? "",
            Department = e.Student.Department?.Name ?? "N/A",
            CGPA = e.Student.Cgpa?.ToString("F2") ?? "N/A",
            Status = e.Status
        }).OrderBy(s => s.EnrollmentNumber).ToList();
        sheets.Add("Student Roster", rosterData);

        // Grades Summary (per student)
        var gradesSummary = enrollments.Select(e =>
        {
            var studentMarks = marks.Where(m => m.Enrollment.StudentId == e.Student.Id).ToList();
            var totalObtained = studentMarks.Where(m => !m.IsAbsent && m.ObtainedMarks.HasValue)
                .Sum(m => m.ObtainedMarks!.Value);
            var totalMax = studentMarks.Sum(m => m.AssessmentItem.MaxMarks);
            var percentage = totalMax > 0 ? Math.Round(totalObtained / totalMax * 100, 2) : 0;

            return new
            {
                EnrollmentNumber = e.Student.EnrollmentNumber,
                StudentName = e.Student.IdNavigation.FullName,
                TotalMarksObtained = totalObtained,
                TotalMaxMarks = totalMax,
                Percentage = percentage,
                Grade = e.Grade ?? CalculateGrade(percentage)
            };
        }).OrderBy(s => s.EnrollmentNumber).ToList();
        sheets.Add("Grades Summary", gradesSummary);

        // Attendance Summary (per student)
        var attendanceSummary = enrollments.Select(e =>
        {
            var studentAttendance = attendance.Where(a => a.Enrollment.StudentId == e.Student.Id).ToList();
            var totalClasses = studentAttendance.Count;
            var present = studentAttendance.Count(a => a.Status == "Present");
            var late = studentAttendance.Count(a => a.Status == "Late");
            var percentage = totalClasses > 0 ? Math.Round((decimal)(present + late) / totalClasses * 100, 2) : 100;

            return new
            {
                EnrollmentNumber = e.Student.EnrollmentNumber,
                StudentName = e.Student.IdNavigation.FullName,
                TotalClasses = totalClasses,
                Present = present,
                Absent = studentAttendance.Count(a => a.Status == "Absent"),
                Late = late,
                AttendancePercentage = percentage,
                Status = percentage >= 75 ? "Good" : percentage >= 60 ? "Warning" : "Critical"
            };
        }).OrderBy(s => s.EnrollmentNumber).ToList();
        sheets.Add("Attendance Summary", attendanceSummary);

        // At-Risk Analysis
        var atRiskData = enrollments.Select(e =>
        {
            var studentAttendance = attendance.Where(a => a.Enrollment.StudentId == e.Student.Id).ToList();
            var totalClasses = studentAttendance.Any() ? studentAttendance.Count : 1;
            var present = studentAttendance.Count(a => a.Status == "Present" || a.Status == "Late");
            var attendancePct = totalClasses > 0 ? Math.Round((decimal)present / totalClasses * 100, 2) : 100;

            var studentMarks = marks.Where(m => m.Enrollment.StudentId == e.Student.Id).ToList();
            var totalObtained = studentMarks.Where(m => !m.IsAbsent && m.ObtainedMarks.HasValue)
                .Sum(m => m.ObtainedMarks!.Value);
            var totalMax = studentMarks.Any() ? studentMarks.Sum(m => m.AssessmentItem.MaxMarks) : 1;
            var gradePct = totalMax > 0 ? Math.Round(totalObtained / totalMax * 100, 2) : 0;

            var riskLevel = DetermineRiskStatus(attendancePct, gradePct);

            return new
            {
                EnrollmentNumber = e.Student.EnrollmentNumber,
                StudentName = e.Student.IdNavigation.FullName,
                AttendancePercentage = attendancePct,
                GradePercentage = gradePct,
                RiskLevel = riskLevel,
                PrimaryRiskFactor = attendancePct < gradePct ? "Low Attendance" : "Low Grades"
            };
        }).Where(s => s.RiskLevel != "Good").OrderBy(s => s.RiskLevel).ThenBy(s => s.EnrollmentNumber).ToList();

        if (atRiskData.Any())
        {
            sheets.Add("At-Risk Students", atRiskData);
        }

        return ExcelHelperService.GenerateExcelWithMultipleSheets(sheets);
    }

    #endregion

    #region Private Helper Methods

    private async Task<List<CourseEnrollment>> GetCourseEnrollmentsAsync(int courseOfferingId, string? status)
    {
        var filter = new CourseEnrollmentFilterRequest
        {
            CourseOfferingId = courseOfferingId,
            Status = status,
            PageSize = int.MaxValue
        };

        var (enrollments, _) = await _courseEnrollmentRepository.GetAllAsync(filter);
        return enrollments;
    }

    private async Task<List<StudentMark>> GetCourseMarksAsync(int courseOfferingId, int? assessmentItemId)
    {
        var filter = new StudentMarkFilterRequest
        {
            CourseOfferingId = courseOfferingId,
            AssessmentItemId = assessmentItemId,
            PageSize = int.MaxValue
        };

        var (marks, _) = await _studentMarkRepository.GetAllAsync(filter);
        return marks;
    }

    private async Task<List<AttendanceRecord>> GetCourseAttendanceAsync(int courseOfferingId, DateTime? fromDate, DateTime? toDate)
    {
        var filter = new AttendanceRecordFilterRequest
        {
            CourseOfferingId = courseOfferingId,
            FromDate = fromDate.HasValue ? DateOnly.FromDateTime(fromDate.Value) : null,
            ToDate = toDate.HasValue ? DateOnly.FromDateTime(toDate.Value) : null,
            PageSize = int.MaxValue
        };

        var (attendance, _) = await _attendanceRecordRepository.GetAllAsync(filter);
        return attendance;
    }

    private async Task<(decimal Percentage, int Total, int Attended)> GetStudentAttendanceStatsAsync(int studentId, int courseOfferingId)
    {
        var filter = new AttendanceRecordFilterRequest
        {
            StudentId = studentId,
            CourseOfferingId = courseOfferingId,
            PageSize = int.MaxValue
        };

        var (attendance, _) = await _attendanceRecordRepository.GetAllAsync(filter);
        var total = attendance.Count;
        var attended = attendance.Count(a => a.Status == "Present" || a.Status == "Late");
        var percentage = total > 0 ? Math.Round((decimal)attended / total * 100, 2) : 100;

        return (percentage, total, attended);
    }

    private async Task<(decimal Percentage, decimal Obtained, decimal Total)> GetStudentGradeStatsAsync(int studentId, int courseOfferingId)
    {
        var filter = new StudentMarkFilterRequest
        {
            StudentId = studentId,
            CourseOfferingId = courseOfferingId,
            PageSize = int.MaxValue
        };

        var (marks, _) = await _studentMarkRepository.GetAllAsync(filter);
        var totalObtained = marks.Where(m => !m.IsAbsent && m.ObtainedMarks.HasValue).Sum(m => m.ObtainedMarks!.Value);
        var totalMax = marks.Sum(m => m.AssessmentItem.MaxMarks);
        var percentage = totalMax > 0 ? Math.Round(totalObtained / totalMax * 100, 2) : 0;

        return (percentage, totalObtained, totalMax);
    }

    private async Task<List<AtRiskStudentExcelExport>> GetAtRiskStudentsAsync(int courseOfferingId, string? riskLevel)
    {
        var enrollments = await GetCourseEnrollmentsAsync(courseOfferingId, null);
        var marks = await GetCourseMarksAsync(courseOfferingId, null);
        var attendance = await GetCourseAttendanceAsync(courseOfferingId, null, null);

        var atRiskStudents = new List<AtRiskStudentExcelExport>();

        foreach (var enrollment in enrollments)
        {
            var studentAttendance = attendance.Where(a => a.Enrollment.StudentId == enrollment.Student.Id).ToList();
            var totalClasses = studentAttendance.Any() ? studentAttendance.Count : 1;
            var present = studentAttendance.Count(a => a.Status == "Present" || a.Status == "Late");
            var attendancePct = totalClasses > 0 ? Math.Round((decimal)present / totalClasses * 100, 2) : 100;

            var studentMarks = marks.Where(m => m.Enrollment.StudentId == enrollment.Student.Id).ToList();
            var totalObtained = studentMarks.Where(m => !m.IsAbsent && m.ObtainedMarks.HasValue)
                .Sum(m => m.ObtainedMarks!.Value);
            var totalMax = studentMarks.Any() ? studentMarks.Sum(m => m.AssessmentItem.MaxMarks) : 1;
            var gradePct = totalMax > 0 ? Math.Round(totalObtained / totalMax * 100, 2) : 0;

            var studentRiskLevel = DetermineRiskStatus(attendancePct, gradePct);

            // Filter by risk level if specified
            if (studentRiskLevel == "Good") continue;
            if (!string.IsNullOrEmpty(riskLevel) && studentRiskLevel != riskLevel) continue;

            var missedClasses = studentAttendance.Count(a => a.Status == "Absent");
            var failingAssessments = studentMarks.Count(m =>
                m.ObtainedMarks.HasValue &&
                m.ObtainedMarks.Value / m.AssessmentItem.MaxMarks < 0.4m);

            var primaryFactor = attendancePct < gradePct ? "Low Attendance" : "Low Grades";
            var recommendations = GenerateRecommendations(attendancePct, gradePct);

            atRiskStudents.Add(new AtRiskStudentExcelExport
            {
                EnrollmentNumber = enrollment.Student.EnrollmentNumber,
                StudentName = enrollment.Student.IdNavigation.FullName,
                Email = enrollment.Student.IdNavigation.PersonalEmail ?? "",
                BatchName = enrollment.CourseOffering.Batch?.Name ?? "N/A",
                Semester = enrollment.Student.CurrentSemester,
                RiskLevel = studentRiskLevel,
                AttendancePercentage = attendancePct,
                GradePercentage = gradePct,
                MissedClasses = missedClasses,
                FailingAssessments = failingAssessments,
                PrimaryRiskFactor = primaryFactor,
                Recommendations = recommendations
            });
        }

        return atRiskStudents;
    }

    private static string DetermineRiskStatus(decimal attendancePct, decimal gradePct)
    {
        if (attendancePct < 60 || gradePct < 40)
            return "High";
        if (attendancePct < 75 || gradePct < 60)
            return "Medium";
        if (attendancePct < 85 || gradePct < 70)
            return "Low";
        return "Good";
    }

    private static string GenerateRecommendations(decimal attendancePct, decimal gradePct)
    {
        var recommendations = new List<string>();

        if (attendancePct < 60)
            recommendations.Add("Urgent: Improve attendance immediately");
        else if (attendancePct < 75)
            recommendations.Add("Increase class attendance");

        if (gradePct < 40)
            recommendations.Add("Urgent: Schedule tutoring/extra help");
        else if (gradePct < 60)
            recommendations.Add("Focus on weak subjects");

        return string.Join("; ", recommendations);
    }

    private static string CalculateMarkPercentageString(StudentMark mark)
    {
        if (mark.IsAbsent) return "0%";
        if (!mark.ObtainedMarks.HasValue) return "N/A";
        if (mark.AssessmentItem.MaxMarks == 0) return "N/A";
        var percentage = mark.ObtainedMarks.Value / mark.AssessmentItem.MaxMarks * 100;
        return $"{percentage:F2}%";
    }

    private static string GetMarkStatus(StudentMark mark)
    {
        if (mark.IsAbsent) return "Absent";
        if (!mark.ObtainedMarks.HasValue) return "Pending";
        return "Graded";
    }

    private static string CalculateGrade(decimal percentage)
    {
        return percentage switch
        {
            >= 90 => "A+",
            >= 80 => "A",
            >= 70 => "B+",
            >= 60 => "B",
            >= 50 => "C+",
            >= 40 => "C",
            >= 35 => "D",
            _ => "F"
        };
    }

    private static byte[] GenerateRosterExcel(CourseRosterHeaderInfo header, List<StudentRosterExcelExport> data)
    {
        var sheets = new Dictionary<string, object>
        {
            {
                "Course Info", new List<object>
                {
                    new { Field = "Subject Code", Value = header.SubjectCode },
                    new { Field = "Subject Name", Value = header.SubjectName },
                    new { Field = "Credits", Value = header.Credits.ToString() },
                    new { Field = "Semester", Value = header.Semester.ToString() },
                    new { Field = "Batch", Value = header.BatchName },
                    new { Field = "Academic Year", Value = header.AcademicYear },
                    new { Field = "Faculty", Value = header.FacultyName },
                    new { Field = "Total Students", Value = header.TotalStudents.ToString() },
                    new { Field = "Generated Date", Value = header.GeneratedDate.ToString("dd-MMM-yyyy HH:mm") }
                }
            },
            { "Student Roster", data }
        };

        return ExcelHelperService.GenerateExcelWithMultipleSheets(sheets);
    }

    private static byte[] GenerateGradesExcel(FacultyGradesHeaderInfo header, List<FacultyGradesExcelExport> grades, object studentSummary)
    {
        var sheets = new Dictionary<string, object>
        {
            {
                "Course Info", new List<object>
                {
                    new { Field = "Subject Code", Value = header.SubjectCode },
                    new { Field = "Subject Name", Value = header.SubjectName },
                    new { Field = "Credits", Value = header.Credits.ToString() },
                    new { Field = "Semester", Value = header.Semester.ToString() },
                    new { Field = "Batch", Value = header.BatchName },
                    new { Field = "Academic Year", Value = header.AcademicYear },
                    new { Field = "Faculty", Value = header.FacultyName },
                    new { Field = "Total Students", Value = header.TotalStudents.ToString() },
                    new { Field = "Assessments Count", Value = header.AssessmentsCount.ToString() },
                    new { Field = "Class Average", Value = $"{header.ClassAverage:F2}%" },
                    new { Field = "Highest Score", Value = $"{header.HighestScore:F2}%" },
                    new { Field = "Lowest Score", Value = $"{header.LowestScore:F2}%" },
                    new { Field = "Generated Date", Value = header.GeneratedDate.ToString("dd-MMM-yyyy HH:mm") }
                }
            },
            { "Student Summary", studentSummary },
            { "Detailed Grades", grades }
        };

        return ExcelHelperService.GenerateExcelWithMultipleSheets(sheets);
    }

    private static byte[] GenerateAttendanceExcel(
        FacultyAttendanceHeaderInfo header,
        List<StudentAttendanceSummaryExport> summary,
        List<FacultyAttendanceExcelExport> details)
    {
        var fromDateStr = header.FromDate?.ToString("dd-MMM-yyyy") ?? "Start";
        var toDateStr = header.ToDate?.ToString("dd-MMM-yyyy") ?? "Present";

        var sheets = new Dictionary<string, object>
        {
            {
                "Course Info", new List<object>
                {
                    new { Field = "Subject Code", Value = header.SubjectCode },
                    new { Field = "Subject Name", Value = header.SubjectName },
                    new { Field = "Batch", Value = header.BatchName },
                    new { Field = "Semester", Value = header.Semester.ToString() },
                    new { Field = "Academic Year", Value = header.AcademicYear },
                    new { Field = "Faculty", Value = header.FacultyName },
                    new { Field = "Total Students", Value = header.TotalStudents.ToString() },
                    new { Field = "Total Classes", Value = header.TotalClasses.ToString() },
                    new { Field = "Class Average Attendance", Value = $"{header.ClassAverageAttendance:F2}%" },
                    new { Field = "Period", Value = $"{fromDateStr} to {toDateStr}" },
                    new { Field = "Generated Date", Value = header.GeneratedDate.ToString("dd-MMM-yyyy HH:mm") }
                }
            },
            { "Student Summary", summary },
            { "Detailed Records", details }
        };

        return ExcelHelperService.GenerateExcelWithMultipleSheets(sheets);
    }

    #endregion
}
