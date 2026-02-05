using GradeSense.API.DTOs.AuditLog.Request;
using GradeSense.API.DTOs.Batch.Request;
using GradeSense.API.DTOs.CourseOffering.Request;
using GradeSense.API.DTOs.Department.Request;
using GradeSense.API.DTOs.EvaluationScheme.Request;
using GradeSense.API.DTOs.Export;
using GradeSense.API.DTOs.Faculty.Request;
using GradeSense.API.DTOs.Student.Request;
using GradeSense.API.DTOs.Subject.Request;
using GradeSense.API.DTOs.User.Request;
using GradeSense.API.Helpers;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;

namespace GradeSense.API.Services;

/// <summary>
/// Service implementation for data export functionality
/// </summary>
public class ExportService : IExportService
{
    private readonly IUserRepository _userRepository;
    private readonly IFacultyRepository _facultyRepository;
    private readonly IStudentRepository _studentRepository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IBatchRepository _batchRepository;
    private readonly ISubjectRepository _subjectRepository;
    private readonly ICourseOfferingRepository _courseOfferingRepository;
    private readonly IEvaluationSchemeRepository _evaluationSchemeRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly ILogger<ExportService> _logger;

    public ExportService(
        IUserRepository userRepository,
        IFacultyRepository facultyRepository,
        IStudentRepository studentRepository,
        IDepartmentRepository departmentRepository,
        IBatchRepository batchRepository,
        ISubjectRepository subjectRepository,
        ICourseOfferingRepository courseOfferingRepository,
        IEvaluationSchemeRepository evaluationSchemeRepository,
        IAuditLogRepository auditLogRepository,
        ILogger<ExportService> logger)
    {
        _userRepository = userRepository;
        _facultyRepository = facultyRepository;
        _studentRepository = studentRepository;
        _departmentRepository = departmentRepository;
        _batchRepository = batchRepository;
        _subjectRepository = subjectRepository;
        _courseOfferingRepository = courseOfferingRepository;
        _evaluationSchemeRepository = evaluationSchemeRepository;
        _auditLogRepository = auditLogRepository;
        _logger = logger;
    }

    #region User Exports

    public async Task<byte[]> ExportUsersToCsvAsync(UserExportFilterRequest filter)
    {
        var filterRequest = new UserFilterRequest
        {
            SearchTerm = filter.Search,
            Role = filter.Role,
            IsActive = filter.IsActive,
            PageSize = int.MaxValue
        };

        var (users, _) = await _userRepository.GetAllAsync(filterRequest);

        var exportData = users.Select(u => new UserCsvExport
        {
            Id = u.Id,
            FullName = u.FullName,
            PersonalEmail = u.PersonalEmail,
            InstitutionalEmail = u.InstitutionalEmail,
            PhoneNumber = u.PhoneNumber,
            Role = u.Role,
            IsActive = u.IsActive ? "Yes" : "No",
            CreatedAt = u.CreatedAt
        }).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportUsersToExcelAsync(UserExportFilterRequest filter)
    {
        var filterRequest = new UserFilterRequest
        {
            SearchTerm = filter.Search,
            Role = filter.Role,
            IsActive = filter.IsActive,
            PageSize = int.MaxValue
        };

        var (users, _) = await _userRepository.GetAllAsync(filterRequest);

        var exportData = users.Select(u => new UserExcelExport
        {
            Id = u.Id,
            FullName = u.FullName,
            PersonalEmail = u.PersonalEmail,
            InstitutionalEmail = u.InstitutionalEmail,
            PhoneNumber = u.PhoneNumber,
            Role = u.Role,
            IsActive = u.IsActive ? "Yes" : "No",
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt,
            FacultyEmployeeId = u.Faculty?.EmployeeId,
            FacultyDepartment = u.Faculty?.Department?.Name,
            FacultyDesignation = u.Faculty?.Designation,
            StudentEnrollmentNumber = u.Student?.EnrollmentNumber,
            StudentDepartment = u.Student?.Department?.Name,
            StudentCurrentSemester = u.Student?.CurrentSemester,
            StudentCGPA = u.Student?.Cgpa
        }).ToList();

        return ExcelHelperService.GenerateExcel(exportData, "Users");
    }

    #endregion

    #region Faculty Exports

    public async Task<byte[]> ExportFacultiesToCsvAsync(FacultyExportFilterRequest filter)
    {
        var filterRequest = new FacultyFilterRequest
        {
            SearchTerm = filter.Search,
            DepartmentId = filter.DepartmentId,
            Designation = filter.Designation,
            PageSize = int.MaxValue
        };

        var (faculties, _) = await _facultyRepository.GetAllAsync(filterRequest);

        var exportData = faculties.Select(f => new FacultyCsvExport
        {
            Id = f.Id,
            EmployeeId = f.EmployeeId,
            FullName = f.IdNavigation.FullName,
            PersonalEmail = f.IdNavigation.PersonalEmail,
            InstitutionalEmail = f.IdNavigation.InstitutionalEmail,
            PhoneNumber = f.IdNavigation.PhoneNumber,
            DepartmentName = f.Department?.Name ?? "N/A",
            Designation = f.Designation,
            IsActive = f.IdNavigation.IsActive ? "Yes" : "No",
            CreatedAt = f.CreatedAt
        }).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportFacultiesToExcelAsync(FacultyExportFilterRequest filter)
    {
        var filterRequest = new FacultyFilterRequest
        {
            SearchTerm = filter.Search,
            DepartmentId = filter.DepartmentId,
            Designation = filter.Designation,
            PageSize = int.MaxValue
        };

        var (faculties, _) = await _facultyRepository.GetAllAsync(filterRequest);

        var exportData = new List<FacultyExcelExport>();
        foreach (var f in faculties)
        {
            exportData.Add(new FacultyExcelExport
            {
                Id = f.Id,
                EmployeeId = f.EmployeeId,
                FullName = f.IdNavigation.FullName,
                PersonalEmail = f.IdNavigation.PersonalEmail,
                InstitutionalEmail = f.IdNavigation.InstitutionalEmail,
                PhoneNumber = f.IdNavigation.PhoneNumber,
                DepartmentId = f.DepartmentId,
                DepartmentName = f.Department?.Name ?? "N/A",
                DepartmentCode = f.Department?.Code,
                Designation = f.Designation,
                JoiningDate = f.JoiningDate,
                Qualification = f.Qualification,
                Specialization = f.Specialization,
                IsActive = f.IdNavigation.IsActive ? "Yes" : "No",
                AssignedCoursesCount = await _facultyRepository.GetAssignedCoursesCountAsync(f.Id),
                CoordinatingBatchesCount = await _facultyRepository.GetCoordinatingBatchesCountAsync(f.Id),
                CoordinatingCoursesCount = await _facultyRepository.GetCoordinatingCoursesCountAsync(f.Id),
                CreatedAt = f.CreatedAt,
                UpdatedAt = f.UpdatedAt
            });
        }

        return ExcelHelperService.GenerateExcel(exportData, "Faculties");
    }

    #endregion

    #region Student Exports

    public async Task<byte[]> ExportStudentsToCsvAsync(StudentExportFilterRequest filter)
    {
        var filterRequest = new StudentFilterRequest
        {
            DepartmentId = filter.DepartmentId,
            Status = filter.Status,
            AdmissionYear = filter.AdmissionYear,
            CurrentSemester = filter.CurrentSemester,
            PageSize = int.MaxValue
        };

        var (students, _) = await _studentRepository.GetAllAsync(filterRequest);

        var exportData = students.Select(s => new StudentCsvExport
        {
            Id = s.Id,
            EnrollmentNumber = s.EnrollmentNumber,
            FullName = s.IdNavigation.FullName,
            PersonalEmail = s.IdNavigation.PersonalEmail,
            InstitutionalEmail = s.IdNavigation.InstitutionalEmail,
            PhoneNumber = s.IdNavigation.PhoneNumber,
            DepartmentName = s.Department?.Name ?? "N/A",
            CurrentSemester = s.CurrentSemester,
            Status = s.Status,
            CGPA = s.Cgpa,
            IsActive = s.IdNavigation.IsActive ? "Yes" : "No",
            CreatedAt = s.CreatedAt
        }).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportStudentsToExcelAsync(StudentExportFilterRequest filter)
    {
        var filterRequest = new StudentFilterRequest
        {
            DepartmentId = filter.DepartmentId,
            Status = filter.Status,
            AdmissionYear = filter.AdmissionYear,
            CurrentSemester = filter.CurrentSemester,
            PageSize = int.MaxValue
        };

        var (students, _) = await _studentRepository.GetAllAsync(filterRequest);

        var exportData = new List<StudentExcelExport>();
        foreach (var s in students)
        {
            exportData.Add(new StudentExcelExport
            {
                Id = s.Id,
                EnrollmentNumber = s.EnrollmentNumber,
                FullName = s.IdNavigation.FullName,
                PersonalEmail = s.IdNavigation.PersonalEmail,
                InstitutionalEmail = s.IdNavigation.InstitutionalEmail,
                PhoneNumber = s.IdNavigation.PhoneNumber,
                AdmissionYear = s.AdmissionYear,
                CurrentSemester = s.CurrentSemester,
                DepartmentId = s.DepartmentId,
                DepartmentName = s.Department?.Name ?? "N/A",
                DepartmentCode = s.Department?.Code,
                Status = s.Status,
                CGPA = s.Cgpa,
                IsActive = s.IdNavigation.IsActive ? "Yes" : "No",
                EnrolledCoursesCount = await _studentRepository.GetEnrolledCoursesCountAsync(s.Id),
                CompletedCoursesCount = await _studentRepository.GetCompletedCoursesCountAsync(s.Id),
                ActiveCoursesCount = await _studentRepository.GetActiveCoursesCountAsync(s.Id),
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            });
        }

        return ExcelHelperService.GenerateExcel(exportData, "Students");
    }

    #endregion

    #region Department Exports

    public async Task<byte[]> ExportDepartmentsToCsvAsync(DepartmentExportFilterRequest filter)
    {
        var filterRequest = new DepartmentFilterRequest
        {
            SearchTerm = filter.Search,
            IsActive = filter.IsActive,
            PageSize = int.MaxValue
        };

        var (departments, _) = await _departmentRepository.GetAllAsync(filterRequest);

        var exportData = departments.Select(d => new DepartmentCsvExport
        {
            Id = d.Id,
            Name = d.Name,
            Code = d.Code,
            HODName = d.Hoduser?.FullName,
            IsActive = d.IsActive ? "Yes" : "No",
            CreatedAt = d.CreatedAt
        }).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportDepartmentsToExcelAsync(DepartmentExportFilterRequest filter)
    {
        var filterRequest = new DepartmentFilterRequest
        {
            SearchTerm = filter.Search,
            IsActive = filter.IsActive,
            PageSize = int.MaxValue
        };

        var (departments, _) = await _departmentRepository.GetAllAsync(filterRequest);

        var exportData = new List<DepartmentExcelExport>();
        foreach (var d in departments)
        {
            exportData.Add(new DepartmentExcelExport
            {
                Id = d.Id,
                Name = d.Name,
                Code = d.Code,
                HODUserId = d.HoduserId,
                HODName = d.Hoduser?.FullName,
                HODEmail = d.Hoduser?.PersonalEmail,
                IsActive = d.IsActive ? "Yes" : "No",
                FacultyCount = await _departmentRepository.GetFacultyCountAsync(d.Id),
                StudentCount = await _departmentRepository.GetStudentCountAsync(d.Id),
                SubjectCount = await _departmentRepository.GetSubjectCountAsync(d.Id),
                BatchCount = await _departmentRepository.GetBatchCountAsync(d.Id),
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            });
        }

        return ExcelHelperService.GenerateExcel(exportData, "Departments");
    }

    #endregion

    #region Batch Exports

    public async Task<byte[]> ExportBatchesToCsvAsync(BatchExportFilterRequest filter)
    {
        var filterRequest = new BatchFilterRequest
        {
            SearchTerm = filter.Search,
            DepartmentId = filter.DepartmentId,
            Semester = filter.Semester,
            AcademicYear = filter.AcademicYear,
            IsActive = filter.IsActive,
            PageSize = int.MaxValue
        };

        var (batches, _) = await _batchRepository.GetAllAsync(filterRequest);

        var exportData = batches.Select(b => new BatchCsvExport
        {
            Id = b.Id,
            Name = b.Name,
            Semester = b.Semester,
            AcademicYear = b.AcademicYear,
            DepartmentName = b.Department?.Name ?? "N/A",
            ClassCoordinatorName = b.ClassCoordinator?.IdNavigation?.FullName,
            Division = b.Division,
            IsActive = b.IsActive ? "Yes" : "No",
            CreatedAt = b.CreatedAt
        }).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportBatchesToExcelAsync(BatchExportFilterRequest filter)
    {
        var filterRequest = new BatchFilterRequest
        {
            SearchTerm = filter.Search,
            DepartmentId = filter.DepartmentId,
            Semester = filter.Semester,
            AcademicYear = filter.AcademicYear,
            IsActive = filter.IsActive,
            PageSize = int.MaxValue
        };

        var (batches, _) = await _batchRepository.GetAllAsync(filterRequest);

        var exportData = new List<BatchExcelExport>();
        foreach (var b in batches)
        {
            exportData.Add(new BatchExcelExport
            {
                Id = b.Id,
                Name = b.Name,
                Semester = b.Semester,
                AcademicYear = b.AcademicYear,
                DepartmentId = b.DepartmentId,
                DepartmentName = b.Department?.Name ?? "N/A",
                DepartmentCode = b.Department?.Code,
                ClassCoordinatorId = b.ClassCoordinatorId,
                ClassCoordinatorName = b.ClassCoordinator?.IdNavigation?.FullName,
                ClassCoordinatorEmail = b.ClassCoordinator?.IdNavigation?.PersonalEmail,
                ClassCoordinatorEmployeeId = b.ClassCoordinator?.EmployeeId,
                Division = b.Division,
                IsActive = b.IsActive ? "Yes" : "No",
                CourseOfferingsCount = await _batchRepository.GetCourseOfferingsCountAsync(b.Id),
                CreatedAt = b.CreatedAt,
                UpdatedAt = b.UpdatedAt
            });
        }

        return ExcelHelperService.GenerateExcel(exportData, "Batches");
    }

    #endregion

    #region Subject Exports

    public async Task<byte[]> ExportSubjectsToCsvAsync(SubjectExportFilterRequest filter)
    {
        var filterRequest = new SubjectFilterRequest
        {
            SearchTerm = filter.Search,
            DepartmentId = filter.DepartmentId,
            Semester = filter.Semester,
            SubjectType = filter.SubjectType,
            IsElective = filter.IsElective,
            IsActive = filter.IsActive,
            PageSize = int.MaxValue
        };

        var (subjects, _) = await _subjectRepository.GetAllAsync(filterRequest);

        var exportData = subjects.Select(s => new SubjectCsvExport
        {
            Id = s.Id,
            Code = s.Code,
            Name = s.Name,
            Credit = s.Credit,
            DepartmentName = s.Department?.Name ?? "N/A",
            Semester = s.Semester,
            SubjectType = s.SubjectType,
            IsElective = s.IsElective ? "Yes" : "No",
            IsActive = s.IsActive ? "Yes" : "No",
            CreatedAt = s.CreatedAt
        }).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportSubjectsToExcelAsync(SubjectExportFilterRequest filter)
    {
        var filterRequest = new SubjectFilterRequest
        {
            SearchTerm = filter.Search,
            DepartmentId = filter.DepartmentId,
            Semester = filter.Semester,
            SubjectType = filter.SubjectType,
            IsElective = filter.IsElective,
            IsActive = filter.IsActive,
            PageSize = int.MaxValue
        };

        var (subjects, _) = await _subjectRepository.GetAllAsync(filterRequest);

        var exportData = new List<SubjectExcelExport>();
        foreach (var s in subjects)
        {
            exportData.Add(new SubjectExcelExport
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                Credit = s.Credit,
                DepartmentId = s.DepartmentId,
                DepartmentName = s.Department?.Name ?? "N/A",
                DepartmentCode = s.Department?.Code,
                Semester = s.Semester,
                SubjectType = s.SubjectType,
                IsElective = s.IsElective ? "Yes" : "No",
                PrerequisiteSubjectId = s.PrerequisiteSubjectId,
                PrerequisiteSubjectCode = s.PrerequisiteSubject?.Code,
                PrerequisiteSubjectName = s.PrerequisiteSubject?.Name,
                Description = s.Description,
                IsActive = s.IsActive ? "Yes" : "No",
                SubjectUnitsCount = await _subjectRepository.GetSubjectUnitsCountAsync(s.Id),
                CourseOfferingsCount = await _subjectRepository.GetCourseOfferingsCountAsync(s.Id),
                DependentSubjectsCount = await _subjectRepository.GetDependentSubjectsCountAsync(s.Id),
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
            });
        }

        return ExcelHelperService.GenerateExcel(exportData, "Subjects");
    }

    #endregion

    #region Course Offering Exports

    public async Task<byte[]> ExportCourseOfferingsToCsvAsync(CourseOfferingExportFilterRequest filter)
    {
        var filterRequest = new CourseOfferingFilterRequest
        {
            SearchTerm = filter.Search,
            SubjectId = filter.SubjectId,
            BatchId = filter.BatchId,
            DepartmentId = filter.DepartmentId,
            AcademicYear = filter.AcademicYear,
            IsActive = filter.IsActive,
            PageSize = int.MaxValue
        };

        var (courseOfferings, _) = await _courseOfferingRepository.GetAllAsync(filterRequest);

        var exportData = courseOfferings.Select(c => new CourseOfferingCsvExport
        {
            Id = c.Id,
            SubjectCode = c.Subject?.Code ?? "N/A",
            SubjectName = c.Subject?.Name ?? "N/A",
            BatchName = c.Batch?.Name ?? "N/A",
            SubjectCoordinatorName = c.SubjectCoordinator?.IdNavigation?.FullName ?? "N/A",
            AcademicYear = c.AcademicYear,
            MaxEnrollment = c.MaxEnrollment,
            IsActive = c.IsActive ? "Yes" : "No",
            CreatedAt = c.CreatedAt
        }).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportCourseOfferingsToExcelAsync(CourseOfferingExportFilterRequest filter)
    {
        var filterRequest = new CourseOfferingFilterRequest
        {
            SearchTerm = filter.Search,
            SubjectId = filter.SubjectId,
            BatchId = filter.BatchId,
            DepartmentId = filter.DepartmentId,
            AcademicYear = filter.AcademicYear,
            IsActive = filter.IsActive,
            PageSize = int.MaxValue
        };

        var (courseOfferings, _) = await _courseOfferingRepository.GetAllAsync(filterRequest);

        var exportData = new List<CourseOfferingExcelExport>();
        foreach (var c in courseOfferings)
        {
            exportData.Add(new CourseOfferingExcelExport
            {
                Id = c.Id,
                SubjectId = c.SubjectId,
                SubjectCode = c.Subject?.Code ?? "N/A",
                SubjectName = c.Subject?.Name ?? "N/A",
                SubjectCredit = c.Subject?.Credit ?? 0,
                SubjectDepartmentName = c.Subject?.Department?.Name ?? "N/A",
                BatchId = c.BatchId,
                BatchName = c.Batch?.Name ?? "N/A",
                BatchSemester = c.Batch?.Semester ?? 0,
                BatchDepartmentName = c.Batch?.Department?.Name ?? "N/A",
                SubjectCoordinatorId = c.SubjectCoordinatorId,
                SubjectCoordinatorName = c.SubjectCoordinator?.IdNavigation?.FullName ?? "N/A",
                SubjectCoordinatorEmployeeId = c.SubjectCoordinator?.EmployeeId ?? "N/A",
                SubjectCoordinatorEmail = c.SubjectCoordinator?.IdNavigation?.PersonalEmail ?? "N/A",
                AcademicYear = c.AcademicYear,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                MaxEnrollment = c.MaxEnrollment,
                IsActive = c.IsActive ? "Yes" : "No",
                CourseEnrollmentsCount = await _courseOfferingRepository.GetCourseEnrollmentsCountAsync(c.Id),
                ActiveEnrollmentsCount = await _courseOfferingRepository.GetActiveEnrollmentsCountAsync(c.Id),
                EvaluationSchemesCount = await _courseOfferingRepository.GetEvaluationSchemesCountAsync(c.Id),
                FacultyAssignmentsCount = await _courseOfferingRepository.GetFacultyAssignmentsCountAsync(c.Id),
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            });
        }

        return ExcelHelperService.GenerateExcel(exportData, "CourseOfferings");
    }

    #endregion

    #region Evaluation Scheme Exports

    public async Task<byte[]> ExportEvaluationSchemesToCsvAsync(EvaluationSchemeExportFilterRequest filter)
    {
        var filterRequest = new EvaluationSchemeFilterRequest
        {
            SearchTerm = filter.Search,
            CourseOfferingId = filter.CourseOfferingId,
            SubjectId = filter.SubjectId,
            BatchId = filter.BatchId,
            EvaluationType = filter.EvaluationType,
            IsActive = filter.IsActive,
            PageSize = int.MaxValue
        };

        var (evaluationSchemes, _) = await _evaluationSchemeRepository.GetAllAsync(filterRequest);

        var exportData = evaluationSchemes.Select(e => new EvaluationSchemeCsvExport
        {
            Id = e.Id,
            SubjectCode = e.CourseOffering?.Subject?.Code ?? "N/A",
            SubjectName = e.CourseOffering?.Subject?.Name ?? "N/A",
            BatchName = e.CourseOffering?.Batch?.Name ?? "N/A",
            Name = e.Name,
            TotalMarks = e.TotalMarks,
            PassingMarks = e.PassingMarks,
            Weight = e.Weight,
            EvaluationType = e.EvaluationType,
            IsActive = e.IsActive ? "Yes" : "No",
            CreatedAt = e.CreatedAt
        }).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportEvaluationSchemesToExcelAsync(EvaluationSchemeExportFilterRequest filter)
    {
        var filterRequest = new EvaluationSchemeFilterRequest
        {
            SearchTerm = filter.Search,
            CourseOfferingId = filter.CourseOfferingId,
            SubjectId = filter.SubjectId,
            BatchId = filter.BatchId,
            EvaluationType = filter.EvaluationType,
            IsActive = filter.IsActive,
            PageSize = int.MaxValue
        };

        var (evaluationSchemes, _) = await _evaluationSchemeRepository.GetAllAsync(filterRequest);

        var exportData = new List<EvaluationSchemeExcelExport>();
        foreach (var e in evaluationSchemes)
        {
            exportData.Add(new EvaluationSchemeExcelExport
            {
                Id = e.Id,
                CourseOfferingId = e.CourseOfferingId,
                SubjectCode = e.CourseOffering?.Subject?.Code ?? "N/A",
                SubjectName = e.CourseOffering?.Subject?.Name ?? "N/A",
                SubjectCredit = e.CourseOffering?.Subject?.Credit ?? 0,
                BatchName = e.CourseOffering?.Batch?.Name ?? "N/A",
                BatchSemester = e.CourseOffering?.Batch?.Semester ?? 0,
                DepartmentName = e.CourseOffering?.Batch?.Department?.Name ?? "N/A",
                AcademicYear = e.CourseOffering?.AcademicYear ?? 0,
                Name = e.Name,
                Description = e.Description,
                TotalMarks = e.TotalMarks,
                PassingMarks = e.PassingMarks,
                Weight = e.Weight,
                EvaluationType = e.EvaluationType,
                IsActive = e.IsActive ? "Yes" : "No",
                AssessmentItemsCount = await _evaluationSchemeRepository.GetAssessmentItemsCountAsync(e.Id),
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            });
        }

        return ExcelHelperService.GenerateExcel(exportData, "EvaluationSchemes");
    }

    #endregion

    #region Audit Log Exports

    public async Task<byte[]> ExportAuditLogsToCsvAsync(AuditLogExportFilterRequest filter)
    {
        var filterRequest = new AuditLogFilterRequest
        {
            SearchTerm = filter.Search,
            Action = filter.Action,
            EntityName = filter.EntityName,
            ActorUserId = filter.ActorUserId,
            StartDate = filter.FromDate,
            EndDate = filter.ToDate,
            PageSize = int.MaxValue
        };

        var (auditLogs, _) = await _auditLogRepository.GetAllAsync(filterRequest);

        var exportData = auditLogs.Select(a => new AuditLogCsvExport
        {
            Id = a.Id,
            Action = a.Action,
            ActorUserName = a.ActorUser?.FullName ?? "System",
            EntityName = a.EntityName,
            EntityId = a.EntityId,
            ChangedFields = a.ChangedFields,
            OccurredAt = a.OccurredAt,
            IPAddress = a.Ipaddress
        }).ToList();

        return await CsvHelperService.GenerateCsvAsync(exportData);
    }

    public async Task<byte[]> ExportAuditLogsToExcelAsync(AuditLogExportFilterRequest filter)
    {
        var filterRequest = new AuditLogFilterRequest
        {
            SearchTerm = filter.Search,
            Action = filter.Action,
            EntityName = filter.EntityName,
            ActorUserId = filter.ActorUserId,
            StartDate = filter.FromDate,
            EndDate = filter.ToDate,
            PageSize = int.MaxValue
        };

        var (auditLogs, _) = await _auditLogRepository.GetAllAsync(filterRequest);

        var exportData = auditLogs.Select(a => new AuditLogExcelExport
        {
            Id = a.Id,
            Action = a.Action,
            ActorUserId = a.ActorUserId,
            ActorUserName = a.ActorUser?.FullName ?? "System",
            ActorUserEmail = a.ActorUser?.PersonalEmail ?? "N/A",
            ActorUserRole = a.ActorUser?.Role ?? "System",
            EntityName = a.EntityName,
            EntityId = a.EntityId,
            OldValue = a.OldValue,
            NewValue = a.NewValue,
            ChangedFields = a.ChangedFields,
            OccurredAt = a.OccurredAt,
            IPAddress = a.Ipaddress,
            UserAgent = a.UserAgent,
            SessionId = a.SessionId,
            Reason = a.Reason,
            CreatedAt = a.CreatedAt
        }).ToList();

        return ExcelHelperService.GenerateExcel(exportData, "AuditLogs");
    }

    #endregion
}
