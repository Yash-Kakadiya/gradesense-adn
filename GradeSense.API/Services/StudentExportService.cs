using GradeSense.API.DTOs.AttendanceRecord.Request;
using GradeSense.API.DTOs.CourseEnrollment.Request;
using GradeSense.API.DTOs.Export;
using GradeSense.API.DTOs.StudentMark.Request;
using GradeSense.API.Helpers;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services;

/// <summary>
/// Service implementation for student-specific data export functionality.
/// Allows students to export their own academic data.
/// </summary>
public class StudentExportService : IStudentExportService
{
    private readonly IStudentRepository _studentRepository;
    private readonly ICourseEnrollmentRepository _courseEnrollmentRepository;
    private readonly IStudentMarkRepository _studentMarkRepository;
    private readonly IAttendanceRecordRepository _attendanceRecordRepository;
    private readonly ICourseOfferingRepository _courseOfferingRepository;
    private readonly ILogger<StudentExportService> _logger;

    public StudentExportService(
        IStudentRepository studentRepository,
        ICourseEnrollmentRepository courseEnrollmentRepository,
        IStudentMarkRepository studentMarkRepository,
        IAttendanceRecordRepository attendanceRecordRepository,
        ICourseOfferingRepository courseOfferingRepository,
        ILogger<StudentExportService> logger)
    {
        _studentRepository = studentRepository;
        _courseEnrollmentRepository = courseEnrollmentRepository;
        _studentMarkRepository = studentMarkRepository;
        _attendanceRecordRepository = attendanceRecordRepository;
        _courseOfferingRepository = courseOfferingRepository;
        _logger = logger;
    }

    #region Transcript Exports

    public async Task<byte[]> ExportTranscriptToCsvAsync(int studentId, StudentTranscriptExportRequest? filter = null)
    {
        _logger.LogInformation("Exporting transcript to CSV for student {StudentId}", studentId);

        var student = await _studentRepository.GetByIdAsync(studentId);
        if (student == null)
        {
            throw new ArgumentException($"Student with ID {studentId} not found", nameof(studentId));
        }

        var enrollments = await GetStudentEnrollmentsAsync(studentId, filter?.Semester);
        
        var exportData = enrollments.Select(e => new TranscriptCsvExport
        {
            Semester = $"Semester {e.CourseOffering.Subject.Semester}",
            SubjectCode = e.CourseOffering.Subject.Code ?? "",
            SubjectName = e.CourseOffering.Subject.Name,
            Credits = (int)e.CourseOffering.Subject.Credit,
            SubjectType = e.CourseOffering.Subject.SubjectType ?? "Theory",
            ObtainedMarks = CalculateTotalObtainedMarks(e.StudentMarks),
            TotalMarks = CalculateTotalMaxMarks(e.StudentMarks),
            Percentage = CalculatePercentageString(e.StudentMarks),
            Grade = e.Grade ?? "N/A",
            Status = e.Status
        }).OrderBy(t => t.Semester).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportTranscriptToExcelAsync(int studentId, StudentTranscriptExportRequest? filter = null)
    {
        _logger.LogInformation("Exporting transcript to Excel for student {StudentId}", studentId);

        var student = await _studentRepository.GetByIdAsync(studentId);
        if (student == null)
        {
            throw new ArgumentException($"Student with ID {studentId} not found", nameof(studentId));
        }

        var enrollments = await GetStudentEnrollmentsAsync(studentId, filter?.Semester);

        // Create header info - get batch name from first enrollment if available
        var batchName = enrollments.FirstOrDefault()?.CourseOffering?.Batch?.Name ?? "N/A";
        var headerInfo = new TranscriptHeaderInfo
        {
            StudentName = student.IdNavigation.FullName,
            EnrollmentNumber = student.EnrollmentNumber,
            DepartmentName = student.Department?.Name ?? "N/A",
            BatchName = batchName,
            CurrentSemester = student.CurrentSemester,
            CGPA = student.Cgpa,
            TotalCreditsEarned = enrollments
                .Where(e => e.Status == "Completed")
                .Sum(e => e.CourseOffering.Subject.Credit),
            GeneratedDate = DateTime.Now
        };

        var exportData = enrollments.Select(e => new TranscriptExcelExport
        {
            Semester = e.CourseOffering.Subject.Semester ?? 0,
            SubjectCode = e.CourseOffering.Subject.Code ?? "",
            SubjectName = e.CourseOffering.Subject.Name,
            Credits = (int)e.CourseOffering.Subject.Credit,
            SubjectType = e.CourseOffering.Subject.SubjectType ?? "Theory",
            AcademicYear = $"{e.CourseOffering.AcademicYear}-{e.CourseOffering.AcademicYear + 1}",
            ObtainedMarks = CalculateTotalObtainedMarks(e.StudentMarks),
            TotalMarks = CalculateTotalMaxMarks(e.StudentMarks),
            Percentage = CalculatePercentage(e.StudentMarks),
            Grade = e.Grade ?? "N/A",
            GradePoints = e.GradePoints ?? 0,
            FacultyName = GetPrimaryFacultyName(e.CourseOffering),
            Status = e.Status
        }).OrderBy(t => t.Semester).ThenBy(t => t.SubjectCode).ToList();

        // Generate Excel with header and data
        return GenerateTranscriptExcel(headerInfo, exportData);
    }

    #endregion

    #region Grades Exports

    public async Task<byte[]> ExportGradesToCsvAsync(int studentId, int courseOfferingId)
    {
        _logger.LogInformation("Exporting grades to CSV for student {StudentId}, course {CourseOfferingId}", 
            studentId, courseOfferingId);

        var marks = await GetStudentMarksAsync(studentId, courseOfferingId);

        var exportData = marks.Select(m => new GradesCsvExport
        {
            AssessmentName = m.AssessmentItem.Name,
            AssessmentType = m.AssessmentItem.EvaluationScheme?.EvaluationType ?? "N/A",
            MaxMarks = (int)m.AssessmentItem.MaxMarks,
            ObtainedMarks = m.IsAbsent ? "Absent" : (m.ObtainedMarks?.ToString("F2") ?? "Pending"),
            Percentage = CalculateMarkPercentageString(m),
            Status = GetMarkStatus(m)
        }).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportGradesToExcelAsync(int studentId, int courseOfferingId)
    {
        _logger.LogInformation("Exporting grades to Excel for student {StudentId}, course {CourseOfferingId}", 
            studentId, courseOfferingId);

        var student = await _studentRepository.GetByIdAsync(studentId);
        if (student == null)
        {
            throw new ArgumentException($"Student with ID {studentId} not found", nameof(studentId));
        }

        var courseOffering = await _courseOfferingRepository.GetByIdAsync(courseOfferingId);
        if (courseOffering == null)
        {
            throw new ArgumentException($"Course offering with ID {courseOfferingId} not found", nameof(courseOfferingId));
        }

        var marks = await GetStudentMarksAsync(studentId, courseOfferingId);

        var headerInfo = new GradesHeaderInfo
        {
            StudentName = student.IdNavigation.FullName,
            EnrollmentNumber = student.EnrollmentNumber,
            SubjectCode = courseOffering.Subject?.Code ?? "",
            SubjectName = courseOffering.Subject?.Name ?? "",
            Credits = (int)(courseOffering.Subject?.Credit ?? 0),
            Semester = courseOffering.Subject?.Semester ?? 0,
            FacultyName = GetPrimaryFacultyName(courseOffering),
            AcademicYear = $"{courseOffering.AcademicYear}-{courseOffering.AcademicYear + 1}",
            GeneratedDate = DateTime.Now
        };

        var exportData = marks.Select(m => new GradesExcelExport
        {
            AssessmentName = m.AssessmentItem.Name,
            AssessmentType = m.AssessmentItem.EvaluationScheme?.EvaluationType ?? "N/A",
            Category = m.AssessmentItem.EvaluationScheme?.EvaluationType ?? "N/A",
            MaxMarks = (int)m.AssessmentItem.MaxMarks,
            ObtainedMarks = m.IsAbsent ? null : m.ObtainedMarks,
            Percentage = m.IsAbsent || m.ObtainedMarks == null ? null : 
                (m.ObtainedMarks.Value / m.AssessmentItem.MaxMarks * 100),
            WeightagePercent = m.AssessmentItem.Weight ?? 0,
            WeightedScore = m.IsAbsent || m.ObtainedMarks == null || m.AssessmentItem.Weight == null ? null :
                (m.ObtainedMarks.Value / m.AssessmentItem.MaxMarks * m.AssessmentItem.Weight.Value),
            IsAbsent = m.IsAbsent,
            Status = GetMarkStatus(m),
            GradedDate = m.GradedDate
        }).ToList();

        return GenerateGradesExcel(headerInfo, exportData);
    }

    public async Task<byte[]> ExportAllGradesToExcelAsync(int studentId, int? semester = null)
    {
        _logger.LogInformation("Exporting all grades to Excel for student {StudentId}, semester {Semester}", 
            studentId, semester);

        var student = await _studentRepository.GetByIdAsync(studentId);
        if (student == null)
        {
            throw new ArgumentException($"Student with ID {studentId} not found", nameof(studentId));
        }

        var enrollments = await GetStudentEnrollmentsAsync(studentId, semester);
        
        var sheets = new Dictionary<string, object>();

        // Summary sheet
        var summaryData = enrollments.Select(e => new
        {
            Semester = e.CourseOffering.Subject.Semester,
            SubjectCode = e.CourseOffering.Subject.Code ?? "",
            SubjectName = e.CourseOffering.Subject.Name,
            Credits = (int)e.CourseOffering.Subject.Credit,
            ObtainedMarks = CalculateTotalObtainedMarks(e.StudentMarks),
            TotalMarks = CalculateTotalMaxMarks(e.StudentMarks),
            Percentage = CalculatePercentage(e.StudentMarks),
            Grade = e.Grade ?? "N/A",
            Status = e.Status
        }).OrderBy(s => s.Semester).ThenBy(s => s.SubjectCode).ToList();

        sheets.Add("Summary", summaryData);

        // Per-semester sheets
        var semesterGroups = enrollments.GroupBy(e => e.CourseOffering.Subject.Semester);
        foreach (var group in semesterGroups.OrderBy(g => g.Key))
        {
        var semesterMarks = group.SelectMany(e => e.StudentMarks.Select(m => new
            {
                SubjectCode = e.CourseOffering.Subject.Code ?? "",
                SubjectName = e.CourseOffering.Subject.Name,
                AssessmentName = m.AssessmentItem.Name,
                AssessmentType = m.AssessmentItem.EvaluationScheme?.EvaluationType ?? "N/A",
                MaxMarks = (int)m.AssessmentItem.MaxMarks,
                ObtainedMarks = m.IsAbsent ? "Absent" : (m.ObtainedMarks?.ToString("F2") ?? "Pending"),
                Percentage = CalculateMarkPercentageString(m),
                Status = GetMarkStatus(m)
            })).OrderBy(m => m.SubjectCode).ThenBy(m => m.AssessmentName).ToList();

            sheets.Add($"Semester {group.Key}", semesterMarks);
        }

        return ExcelHelperService.GenerateExcelWithMultipleSheets(sheets);
    }

    #endregion

    #region Attendance Exports

    public async Task<byte[]> ExportAttendanceToCsvAsync(int studentId, StudentAttendanceExportRequest? filter = null)
    {
        _logger.LogInformation("Exporting attendance to CSV for student {StudentId}", studentId);

        var attendance = await GetStudentAttendanceAsync(studentId, filter);

        var exportData = attendance.Select(a => new AttendanceCsvExport
        {
            Date = a.AttendanceDate.ToString("yyyy-MM-dd"),
            SubjectCode = a.Enrollment.CourseOffering.Subject?.Code ?? "",
            SubjectName = a.Enrollment.CourseOffering.Subject?.Name ?? "",
            Status = a.Status,
            Remarks = a.Remarks ?? ""
        }).OrderByDescending(a => a.Date).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportAttendanceToExcelAsync(int studentId, StudentAttendanceExportRequest? filter = null)
    {
        _logger.LogInformation("Exporting attendance to Excel for student {StudentId}", studentId);

        var student = await _studentRepository.GetByIdAsync(studentId);
        if (student == null)
        {
            throw new ArgumentException($"Student with ID {studentId} not found", nameof(studentId));
        }

        var attendance = await GetStudentAttendanceAsync(studentId, filter);
        var enrollments = await GetStudentEnrollmentsAsync(studentId, filter?.Semester);

        // Calculate summary per course
        var summaryData = enrollments.Select(e =>
        {
            var courseAttendance = attendance.Where(a => a.Enrollment.CourseOfferingId == e.CourseOfferingId).ToList();
            var totalClasses = courseAttendance.Count;
            var attended = courseAttendance.Count(a => a.Status == "Present" || a.Status == "Late");
            var absent = courseAttendance.Count(a => a.Status == "Absent");
            var late = courseAttendance.Count(a => a.Status == "Late");
            var percentage = totalClasses > 0 ? (decimal)attended / totalClasses * 100 : 100;

            return new AttendanceSummaryExport
            {
                SubjectCode = e.CourseOffering.Subject?.Code ?? "",
                SubjectName = e.CourseOffering.Subject?.Name ?? "",
                TotalClasses = totalClasses,
                Attended = attended,
                Absent = absent,
                Late = late,
                AttendancePercentage = Math.Round(percentage, 2),
                Status = percentage >= 75 ? "Good" : percentage >= 60 ? "Warning" : "Critical"
            };
        }).OrderBy(s => s.SubjectCode).ToList();

        // Header info
        var totalClasses = summaryData.Sum(s => s.TotalClasses);
        var totalAttended = summaryData.Sum(s => s.Attended);
        var headerInfo = new AttendanceHeaderInfo
        {
            StudentName = student.IdNavigation.FullName,
            EnrollmentNumber = student.EnrollmentNumber,
            DepartmentName = student.Department?.Name ?? "N/A",
            Semester = student.CurrentSemester,
            TotalClasses = totalClasses,
            TotalAttended = totalAttended,
            OverallPercentage = totalClasses > 0 ? Math.Round((decimal)totalAttended / totalClasses * 100, 2) : 100,
            GeneratedDate = DateTime.Now
        };

        // Detailed attendance data
        var detailedData = attendance.Select(a => new AttendanceExcelExport
        {
            Date = a.AttendanceDate.ToDateTime(TimeOnly.MinValue),
            Day = a.AttendanceDate.DayOfWeek.ToString(),
            SubjectCode = a.Enrollment.CourseOffering.Subject?.Code ?? "",
            SubjectName = a.Enrollment.CourseOffering.Subject?.Name ?? "",
            FacultyName = a.RecordedByNavigation?.IdNavigation.FullName ?? "N/A",
            Status = a.Status,
            Remarks = a.Remarks ?? ""
        }).OrderByDescending(a => a.Date).ToList();

        return GenerateAttendanceExcel(headerInfo, summaryData, detailedData);
    }

    #endregion

    #region Combined Reports

    public async Task<byte[]> ExportAcademicReportToExcelAsync(int studentId, int? semester = null)
    {
        _logger.LogInformation("Exporting academic report to Excel for student {StudentId}", studentId);

        var student = await _studentRepository.GetByIdAsync(studentId);
        if (student == null)
        {
            throw new ArgumentException($"Student with ID {studentId} not found", nameof(studentId));
        }

        var enrollments = await GetStudentEnrollmentsAsync(studentId, semester);
        var attendance = await GetStudentAttendanceAsync(studentId, new StudentAttendanceExportRequest { Semester = semester });

        var sheets = new Dictionary<string, object>();

        // Student Info Sheet
        var batchNameForReport = enrollments.FirstOrDefault()?.CourseOffering?.Batch?.Name ?? "N/A";
        var studentInfo = new List<object>
        {
            new { Field = "Student Name", Value = student.IdNavigation.FullName },
            new { Field = "Enrollment Number", Value = student.EnrollmentNumber },
            new { Field = "Department", Value = student.Department?.Name ?? "N/A" },
            new { Field = "Batch", Value = batchNameForReport },
            new { Field = "Current Semester", Value = student.CurrentSemester.ToString() },
            new { Field = "CGPA", Value = student.Cgpa?.ToString("F2") ?? "N/A" },
            new { Field = "Report Generated", Value = DateTime.Now.ToString("dd-MMM-yyyy HH:mm") }
        };
        sheets.Add("Student Info", studentInfo);

        // Grades Summary
        var gradesSummary = enrollments.Select(e => new
        {
            Semester = e.CourseOffering.Subject.Semester,
            SubjectCode = e.CourseOffering.Subject.Code ?? "",
            SubjectName = e.CourseOffering.Subject.Name,
            Credits = (int)e.CourseOffering.Subject.Credit,
            ObtainedMarks = CalculateTotalObtainedMarks(e.StudentMarks),
            TotalMarks = CalculateTotalMaxMarks(e.StudentMarks),
            Percentage = CalculatePercentage(e.StudentMarks),
            Grade = e.Grade ?? "N/A",
            GradePoints = e.GradePoints?.ToString("F2") ?? "N/A",
            Status = e.Status
        }).OrderBy(g => g.Semester).ThenBy(g => g.SubjectCode).ToList();
        sheets.Add("Grades Summary", gradesSummary);

        // Attendance Summary
        var attendanceSummary = enrollments.Select(e =>
        {
            var courseAttendance = attendance.Where(a => a.Enrollment.CourseOfferingId == e.CourseOfferingId).ToList();
            var totalClasses = courseAttendance.Count;
            var attended = courseAttendance.Count(a => a.Status == "Present" || a.Status == "Late");
            var percentage = totalClasses > 0 ? Math.Round((decimal)attended / totalClasses * 100, 2) : 100;

            return new
            {
                Semester = e.CourseOffering.Subject.Semester,
                SubjectCode = e.CourseOffering.Subject.Code ?? "",
                SubjectName = e.CourseOffering.Subject.Name,
                TotalClasses = totalClasses,
                Attended = attended,
                AttendancePercentage = percentage,
                Status = percentage >= 75 ? "Good" : percentage >= 60 ? "Warning" : "Critical"
            };
        }).OrderBy(a => a.Semester).ThenBy(a => a.SubjectCode).ToList();
        sheets.Add("Attendance Summary", attendanceSummary);

        // Semester-wise Performance (if multiple semesters)
        var semesterPerformance = enrollments
            .GroupBy(e => e.CourseOffering.Subject.Semester)
            .Select(g =>
            {
                var semEnrollments = g.ToList();
                var totalCredits = (int)semEnrollments.Sum(e => e.CourseOffering.Subject.Credit);
                var earnedCredits = (int)semEnrollments.Where(e => e.Status == "Completed").Sum(e => e.CourseOffering.Subject.Credit);
                var avgPercentage = semEnrollments.Any(e => e.StudentMarks.Any()) 
                    ? semEnrollments.Where(e => e.StudentMarks.Any()).Average(e => CalculatePercentage(e.StudentMarks))
                    : 0;
                var semAttendance = attendance.Where(a => semEnrollments.Any(e => e.CourseOfferingId == a.Enrollment.CourseOfferingId)).ToList();
                var totalClasses = semAttendance.Count;
                var attended = semAttendance.Count(a => a.Status == "Present" || a.Status == "Late");

                return new
                {
                    Semester = g.Key,
                    Courses = semEnrollments.Count,
                    TotalCredits = totalCredits,
                    EarnedCredits = earnedCredits,
                    AveragePercentage = Math.Round(avgPercentage, 2),
                    TotalClasses = totalClasses,
                    ClassesAttended = attended,
                    AttendancePercentage = totalClasses > 0 ? Math.Round((decimal)attended / totalClasses * 100, 2) : 100
                };
            }).OrderBy(s => s.Semester).ToList();
        sheets.Add("Semester Performance", semesterPerformance);

        return ExcelHelperService.GenerateExcelWithMultipleSheets(sheets);
    }

    #endregion

    #region Private Helper Methods

    private async Task<List<CourseEnrollment>> GetStudentEnrollmentsAsync(int studentId, int? semester = null)
    {
        var filter = new CourseEnrollmentFilterRequest
        {
            StudentId = studentId,
            PageSize = int.MaxValue
        };

        var (enrollments, _) = await _courseEnrollmentRepository.GetAllAsync(filter);

        if (semester.HasValue)
        {
            enrollments = enrollments.Where(e => e.CourseOffering.Subject.Semester == semester.Value).ToList();
        }

        return enrollments;
    }

    private async Task<List<StudentMark>> GetStudentMarksAsync(int studentId, int courseOfferingId)
    {
        var filter = new StudentMarkFilterRequest
        {
            StudentId = studentId,
            CourseOfferingId = courseOfferingId,
            PageSize = int.MaxValue
        };

        var (marks, _) = await _studentMarkRepository.GetAllAsync(filter);
        return marks.OrderBy(m => m.AssessmentItem.EvaluationScheme?.EvaluationType)
                   .ThenBy(m => m.AssessmentItem.Name)
                   .ToList();
    }

    private async Task<List<AttendanceRecord>> GetStudentAttendanceAsync(int studentId, StudentAttendanceExportRequest? filter)
    {
        var attendanceFilter = new AttendanceRecordFilterRequest
        {
            StudentId = studentId,
            CourseOfferingId = filter?.CourseOfferingId,
            FromDate = filter?.FromDate.HasValue == true ? DateOnly.FromDateTime(filter.FromDate.Value) : null,
            ToDate = filter?.ToDate.HasValue == true ? DateOnly.FromDateTime(filter.ToDate.Value) : null,
            PageSize = int.MaxValue
        };

        var (attendance, _) = await _attendanceRecordRepository.GetAllAsync(attendanceFilter);

        // Filter by semester if specified
        if (filter?.Semester.HasValue == true)
        {
            attendance = attendance.Where(a => 
                a.Enrollment.CourseOffering.Subject.Semester == filter.Semester.Value).ToList();
        }

        return attendance;
    }

    private static decimal CalculateTotalObtainedMarks(ICollection<StudentMark> marks)
    {
        return marks.Where(m => !m.IsAbsent && m.ObtainedMarks.HasValue)
                   .Sum(m => m.ObtainedMarks!.Value);
    }

    private static decimal CalculateTotalMaxMarks(ICollection<StudentMark> marks)
    {
        return marks.Sum(m => m.AssessmentItem.MaxMarks);
    }

    private static decimal CalculatePercentage(ICollection<StudentMark> marks)
    {
        var totalMax = CalculateTotalMaxMarks(marks);
        if (totalMax == 0) return 0;
        var totalObtained = CalculateTotalObtainedMarks(marks);
        return Math.Round(totalObtained / totalMax * 100, 2);
    }

    private static string CalculatePercentageString(ICollection<StudentMark> marks)
    {
        var percentage = CalculatePercentage(marks);
        return $"{percentage:F2}%";
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

    private static string GetPrimaryFacultyName(CourseOffering courseOffering)
    {
        // First try to find a faculty with "Primary" or "Lead" role from assignments
        var primaryAssignment = courseOffering.FacultyAssignments?
            .FirstOrDefault(fa => fa.Role?.ToLower() == "primary" || fa.Role?.ToLower() == "lead");
        
        if (primaryAssignment != null)
        {
            return primaryAssignment.Faculty?.IdNavigation.FullName ?? "N/A";
        }

        // Fall back to the SubjectCoordinator
        return courseOffering.SubjectCoordinator?.IdNavigation.FullName ?? "N/A";
    }

    private static byte[] GenerateTranscriptExcel(TranscriptHeaderInfo header, List<TranscriptExcelExport> data)
    {
        var sheets = new Dictionary<string, object>
        {
            { "Transcript", data }
        };

        // Add header info as a separate list
        var headerData = new List<object>
        {
            new { Field = "Student Name", Value = header.StudentName },
            new { Field = "Enrollment Number", Value = header.EnrollmentNumber },
            new { Field = "Department", Value = header.DepartmentName },
            new { Field = "Batch", Value = header.BatchName },
            new { Field = "Current Semester", Value = header.CurrentSemester.ToString() },
            new { Field = "CGPA", Value = header.CGPA?.ToString("F2") ?? "N/A" },
            new { Field = "Total Credits Earned", Value = header.TotalCreditsEarned?.ToString() ?? "0" },
            new { Field = "Generated Date", Value = header.GeneratedDate.ToString("dd-MMM-yyyy HH:mm") }
        };
        sheets.Add("Student Info", headerData);

        return ExcelHelperService.GenerateExcelWithMultipleSheets(sheets);
    }

    private static byte[] GenerateGradesExcel(GradesHeaderInfo header, List<GradesExcelExport> data)
    {
        var sheets = new Dictionary<string, object>
        {
            { "Grades", data }
        };

        var headerData = new List<object>
        {
            new { Field = "Student Name", Value = header.StudentName },
            new { Field = "Enrollment Number", Value = header.EnrollmentNumber },
            new { Field = "Subject Code", Value = header.SubjectCode },
            new { Field = "Subject Name", Value = header.SubjectName },
            new { Field = "Credits", Value = header.Credits.ToString() },
            new { Field = "Semester", Value = header.Semester.ToString() },
            new { Field = "Faculty", Value = header.FacultyName },
            new { Field = "Academic Year", Value = header.AcademicYear },
            new { Field = "Generated Date", Value = header.GeneratedDate.ToString("dd-MMM-yyyy HH:mm") }
        };
        sheets.Add("Course Info", headerData);

        // Calculate totals
        var totalMax = data.Sum(d => d.MaxMarks);
        var totalObtained = data.Where(d => d.ObtainedMarks.HasValue && !d.IsAbsent).Sum(d => d.ObtainedMarks!.Value);
        var totalWeighted = data.Where(d => d.WeightedScore.HasValue).Sum(d => d.WeightedScore!.Value);

        var summaryData = new List<object>
        {
            new { Metric = "Total Assessments", Value = data.Count.ToString() },
            new { Metric = "Total Max Marks", Value = totalMax.ToString() },
            new { Metric = "Total Obtained Marks", Value = totalObtained.ToString("F2") },
            new { Metric = "Overall Percentage", Value = totalMax > 0 ? $"{(totalObtained / totalMax * 100):F2}%" : "N/A" },
            new { Metric = "Weighted Score (out of 100)", Value = $"{totalWeighted:F2}" },
            new { Metric = "Graded", Value = data.Count(d => d.Status == "Graded").ToString() },
            new { Metric = "Pending", Value = data.Count(d => d.Status == "Pending").ToString() },
            new { Metric = "Absent", Value = data.Count(d => d.Status == "Absent").ToString() }
        };
        sheets.Add("Summary", summaryData);

        return ExcelHelperService.GenerateExcelWithMultipleSheets(sheets);
    }

    private static byte[] GenerateAttendanceExcel(
        AttendanceHeaderInfo header, 
        List<AttendanceSummaryExport> summary, 
        List<AttendanceExcelExport> details)
    {
        var sheets = new Dictionary<string, object>();

        // Header info
        var headerData = new List<object>
        {
            new { Field = "Student Name", Value = header.StudentName },
            new { Field = "Enrollment Number", Value = header.EnrollmentNumber },
            new { Field = "Department", Value = header.DepartmentName },
            new { Field = "Semester", Value = header.Semester.ToString() },
            new { Field = "Total Classes", Value = header.TotalClasses.ToString() },
            new { Field = "Classes Attended", Value = header.TotalAttended.ToString() },
            new { Field = "Overall Percentage", Value = $"{header.OverallPercentage:F2}%" },
            new { Field = "Generated Date", Value = header.GeneratedDate.ToString("dd-MMM-yyyy HH:mm") }
        };
        sheets.Add("Student Info", headerData);

        // Summary per course
        sheets.Add("Summary", summary);

        // Detailed attendance records
        sheets.Add("Detailed Records", details);

        return ExcelHelperService.GenerateExcelWithMultipleSheets(sheets);
    }

    #endregion
}
