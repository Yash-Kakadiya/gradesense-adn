using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.StudentMark.Request;
using GradeSense.API.DTOs.StudentMark.Response;
using GradeSense.API.Helpers;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;
using static GradeSense.API.Helpers.ExcelHelperService;

namespace GradeSense.API.Services
{
    public class StudentMarkService : IStudentMarkService
    {
        private readonly IStudentMarkRepository _studentMarkRepository;
        private readonly ICourseEnrollmentRepository _courseEnrollmentRepository;
        private readonly IAssessmentItemRepository _assessmentItemRepository;
        private readonly IFacultyRepository _facultyRepository;
        private readonly ILogger<StudentMarkService> _logger;

        public StudentMarkService(
            IStudentMarkRepository studentMarkRepository,
            ICourseEnrollmentRepository courseEnrollmentRepository,
            IAssessmentItemRepository assessmentItemRepository,
            IFacultyRepository facultyRepository,
            ILogger<StudentMarkService> logger)
        {
            _studentMarkRepository = studentMarkRepository;
            _courseEnrollmentRepository = courseEnrollmentRepository;
            _assessmentItemRepository = assessmentItemRepository;
            _facultyRepository = facultyRepository;
            _logger = logger;
        }

        public async Task<PagedResponse<StudentMarkListResponse>> GetAllAsync(StudentMarkFilterRequest filter)
        {
            var (studentMarks, total) = await _studentMarkRepository.GetAllAsync(filter);

            var data = studentMarks.Select(sm => new StudentMarkListResponse
            {
                Id = sm.Id,
                StudentId = sm.Enrollment.StudentId,
                EnrollmentId = sm.EnrollmentId,
                AssessmentItemId = sm.AssessmentItemId,
                StudentName = sm.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = sm.Enrollment.Student.EnrollmentNumber,
                AssessmentItemName = sm.AssessmentItem.Name,
                AssessmentMaxMarks = sm.AssessmentItem.MaxMarks,
                ObtainedMarks = sm.ObtainedMarks,
                IsAbsent = sm.IsAbsent,
                GraderName = sm.Grader.IdNavigation.FullName,
                GradedDate = sm.GradedDate,
                CreatedAt = sm.CreatedAt
            }).ToList();

            return new PagedResponse<StudentMarkListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<StudentMarkDetailResponse?> GetByIdAsync(int id)
        {
            var studentMark = await _studentMarkRepository.GetByIdAsync(id);
            if (studentMark == null) return null;

            // Calculate percentage
            decimal? percentage = null;
            if (studentMark.ObtainedMarks.HasValue && studentMark.AssessmentItem.MaxMarks > 0)
            {
                percentage = (studentMark.ObtainedMarks.Value / studentMark.AssessmentItem.MaxMarks) * 100;
            }

            return new StudentMarkDetailResponse
            {
                Id = studentMark.Id,
                EnrollmentId = studentMark.EnrollmentId,
                StudentId = studentMark.Enrollment.StudentId,
                StudentName = studentMark.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = studentMark.Enrollment.Student.EnrollmentNumber,
                StudentEmail = studentMark.Enrollment.Student.IdNavigation.PersonalEmail,
                AssessmentItemId = studentMark.AssessmentItemId,
                AssessmentItemName = studentMark.AssessmentItem.Name,
                AssessmentCalculationType = studentMark.AssessmentItem.CalculationType,
                AssessmentMaxMarks = studentMark.AssessmentItem.MaxMarks,
                EvaluationSchemeName = studentMark.AssessmentItem.EvaluationScheme.Name,
                SubjectCode = studentMark.Enrollment.CourseOffering.Subject.Code,
                SubjectName = studentMark.Enrollment.CourseOffering.Subject.Name,
                BatchName = studentMark.Enrollment.CourseOffering.Batch.Name,
                ObtainedMarks = studentMark.ObtainedMarks,
                IsAbsent = studentMark.IsAbsent,
                Remarks = studentMark.Remarks,
                GraderId = studentMark.GraderId,
                GraderName = studentMark.Grader.IdNavigation.FullName,
                GraderEmployeeId = studentMark.Grader.EmployeeId,
                GradedDate = studentMark.GradedDate,
                SubmissionDate = studentMark.SubmissionDate,
                CreatedAt = studentMark.CreatedAt,
                UpdatedAt = studentMark.UpdatedAt,
                DeletedAt = studentMark.DeletedAt,
                Percentage = percentage
            };
        }

        public async Task<StudentMarkResponse> CreateAsync(CreateStudentMarkRequest request)
        {
            // Validate CourseEnrollment exists
            var enrollment = await _courseEnrollmentRepository.GetByIdAsync(request.EnrollmentId);
            if (enrollment == null)
                throw new KeyNotFoundException("Course enrollment not found");

            // Validate AssessmentItem exists
            var assessmentItem = await _assessmentItemRepository.GetByIdAsync(request.AssessmentItemId);
            if (assessmentItem == null)
                throw new KeyNotFoundException("Assessment item not found");

            if (!assessmentItem.IsActive)
                throw new InvalidOperationException("Assessment item is not active");

            // Critical validation: Enrollment and AssessmentItem must be from same CourseOffering
            if (enrollment.CourseOfferingId != assessmentItem.EvaluationScheme.CourseOfferingId)
            {
                throw new InvalidOperationException(
                    "Enrollment and assessment item must belong to the same course offering");
            }

            // Validate Grader exists
            if (!await _facultyRepository.ExistsAsync(request.GraderId))
                throw new KeyNotFoundException("Grader (Faculty) not found");

            // Check for duplicate mark entry
            if (await _studentMarkRepository.MarkExistsForEnrollmentAndAssessmentAsync(
                request.EnrollmentId, request.AssessmentItemId))
            {
                throw new InvalidOperationException(
                    "Mark already exists for this student and assessment item");
            }

            // Validate ObtainedMarks <= MaxMarks
            if (request.ObtainedMarks.HasValue &&
                request.ObtainedMarks.Value > assessmentItem.MaxMarks)
            {
                throw new InvalidOperationException(
                    $"Obtained marks ({request.ObtainedMarks}) cannot exceed maximum marks ({assessmentItem.MaxMarks})");
            }

            // Critical: If IsAbsent = true, ObtainedMarks must be NULL
            if (request.IsAbsent && request.ObtainedMarks.HasValue)
            {
                throw new InvalidOperationException(
                    "Obtained marks must be null when student is marked as absent");
            }

            var studentMark = new StudentMark
            {
                EnrollmentId = request.EnrollmentId,
                AssessmentItemId = request.AssessmentItemId,
                ObtainedMarks = request.ObtainedMarks,
                IsAbsent = request.IsAbsent,
                Remarks = request.Remarks,
                GraderId = request.GraderId,
                GradedDate = request.GradedDate ?? DateTime.Now,
                SubmissionDate = request.SubmissionDate
            };

            await _studentMarkRepository.CreateAsync(studentMark);

            // Reload with navigation properties
            studentMark = await _studentMarkRepository.GetByIdAsync(studentMark.Id);

            return new StudentMarkResponse
            {
                Id = studentMark!.Id,
                EnrollmentId = studentMark.EnrollmentId,
                StudentName = studentMark.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = studentMark.Enrollment.Student.EnrollmentNumber,
                AssessmentItemId = studentMark.AssessmentItemId,
                AssessmentItemName = studentMark.AssessmentItem.Name,
                AssessmentMaxMarks = studentMark.AssessmentItem.MaxMarks,
                ObtainedMarks = studentMark.ObtainedMarks,
                IsAbsent = studentMark.IsAbsent,
                Remarks = studentMark.Remarks,
                GraderId = studentMark.GraderId,
                GraderName = studentMark.Grader.IdNavigation.FullName,
                GradedDate = studentMark.GradedDate,
                SubmissionDate = studentMark.SubmissionDate,
                CreatedAt = studentMark.CreatedAt,
                UpdatedAt = studentMark.UpdatedAt
            };
        }

        public async Task<StudentMarkResponse> UpdateAsync(int id, UpdateStudentMarkRequest request)
        {
            var studentMark = await _studentMarkRepository.GetByIdAsync(id);
            if (studentMark == null)
                throw new KeyNotFoundException("Student mark not found");

            // Validate Grader if being changed
            if (request.GraderId.HasValue &&
                !await _facultyRepository.ExistsAsync(request.GraderId.Value))
            {
                throw new KeyNotFoundException("Grader (Faculty) not found");
            }

            // Validate ObtainedMarks <= MaxMarks
            var maxMarks = studentMark.AssessmentItem.MaxMarks;
            if (request.ObtainedMarks.HasValue && request.ObtainedMarks.Value > maxMarks)
            {
                throw new InvalidOperationException(
                    $"Obtained marks ({request.ObtainedMarks}) cannot exceed maximum marks ({maxMarks})");
            }

            // Critical: If IsAbsent = true, ObtainedMarks must be NULL
            var isAbsent = request.IsAbsent ?? studentMark.IsAbsent;
            var obtainedMarks = request.ObtainedMarks ?? studentMark.ObtainedMarks;

            if (isAbsent && obtainedMarks.HasValue)
            {
                throw new InvalidOperationException(
                    "Obtained marks must be null when student is marked as absent");
            }

            // Update fields if provided
            studentMark.ObtainedMarks = request.ObtainedMarks ?? studentMark.ObtainedMarks;

            if (request.IsAbsent.HasValue)
            {
                studentMark.IsAbsent = request.IsAbsent.Value;
                // If marking as absent, clear obtained marks
                if (studentMark.IsAbsent)
                    studentMark.ObtainedMarks = null;
            }

            studentMark.Remarks = request.Remarks ?? studentMark.Remarks;

            if (request.GraderId.HasValue)
                studentMark.GraderId = request.GraderId.Value;

            studentMark.GradedDate = request.GradedDate ?? studentMark.GradedDate;
            studentMark.SubmissionDate = request.SubmissionDate ?? studentMark.SubmissionDate;

            await _studentMarkRepository.UpdateAsync(studentMark);

            // Reload with navigation properties
            studentMark = await _studentMarkRepository.GetByIdAsync(id);

            return new StudentMarkResponse
            {
                Id = studentMark!.Id,
                EnrollmentId = studentMark.EnrollmentId,
                StudentName = studentMark.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = studentMark.Enrollment.Student.EnrollmentNumber,
                AssessmentItemId = studentMark.AssessmentItemId,
                AssessmentItemName = studentMark.AssessmentItem.Name,
                AssessmentMaxMarks = studentMark.AssessmentItem.MaxMarks,
                ObtainedMarks = studentMark.ObtainedMarks,
                IsAbsent = studentMark.IsAbsent,
                Remarks = studentMark.Remarks,
                GraderId = studentMark.GraderId,
                GraderName = studentMark.Grader.IdNavigation.FullName,
                GradedDate = studentMark.GradedDate,
                SubmissionDate = studentMark.SubmissionDate,
                CreatedAt = studentMark.CreatedAt,
                UpdatedAt = studentMark.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _studentMarkRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Student mark not found");

            return await _studentMarkRepository.DeleteAsync(id);
        }

        #region Bulk Operations

        public async Task<BulkStudentMarkResponse> BulkEntrySaveAsync(BulkStudentMarkRequest request)
        {
            var response = new BulkStudentMarkResponse
            {
                TotalRequested = request.Marks.Count
            };

            // Validate AssessmentItem exists
            var assessmentItem = await _assessmentItemRepository.GetByIdAsync(request.AssessmentItemId);
            if (assessmentItem == null)
                throw new KeyNotFoundException("Assessment item not found");

            if (!assessmentItem.IsActive)
                throw new InvalidOperationException("Assessment item is not active");

            // Validate Grader exists
            if (!await _facultyRepository.ExistsAsync(request.GraderId))
                throw new KeyNotFoundException("Grader (Faculty) not found");

            // Get all enrollments for the course offering
            var courseOfferingId = assessmentItem.EvaluationScheme.CourseOfferingId;
            var enrollments = await _courseEnrollmentRepository.GetByCourseOfferingIdAsync(courseOfferingId);
            var enrollmentMap = enrollments.ToDictionary(e => e.StudentId, e => e);

            foreach (var entry in request.Marks)
            {
                try
                {
                    // Find enrollment for this student
                    if (!enrollmentMap.TryGetValue(entry.StudentId, out var enrollment))
                    {
                        response.FailedEntries++;
                        response.Errors.Add($"Student ID {entry.StudentId} is not enrolled in this course");
                        continue;
                    }

                    // Validate marks obtained doesn't exceed max marks
                    if (entry.MarksObtained > assessmentItem.MaxMarks)
                    {
                        response.FailedEntries++;
                        response.Errors.Add($"Marks for student {entry.StudentId} exceed max marks ({assessmentItem.MaxMarks})");
                        continue;
                    }

                    // Check for existing mark
                    var existingMark = await _studentMarkRepository.FindByStudentAndAssessmentAsync(
                        entry.StudentId, request.AssessmentItemId);

                    if (existingMark != null)
                    {
                        // Update existing mark
                        existingMark.ObtainedMarks = entry.MarksObtained;
                        existingMark.IsAbsent = entry.IsAbsent;
                        existingMark.Remarks = entry.Remarks;
                        existingMark.GraderId = request.GraderId;
                        existingMark.GradedDate = DateTime.UtcNow;
                        existingMark.UpdatedAt = DateTime.UtcNow;
                        await _studentMarkRepository.UpdateAsync(existingMark);
                    }
                    else
                    {
                        // Create new mark
                        var newMark = new StudentMark
                        {
                            EnrollmentId = enrollment.Id,
                            AssessmentItemId = request.AssessmentItemId,
                            ObtainedMarks = entry.MarksObtained,
                            IsAbsent = entry.IsAbsent,
                            Remarks = entry.Remarks,
                            GraderId = request.GraderId,
                            GradedDate = DateTime.UtcNow,
                            CreatedAt = DateTime.UtcNow
                        };
                        await _studentMarkRepository.CreateAsync(newMark);
                    }

                    response.SuccessfulEntries++;
                }
                catch (Exception ex)
                {
                    response.FailedEntries++;
                    response.Errors.Add($"Error processing student {entry.StudentId}: {ex.Message}");
                }
            }

            return response;
        }

        public async Task<BulkOperationResponse<StudentMarkResponse>> BulkImportGradesAsync(
            int assessmentItemId, int graderId, Stream csvStream)
        {
            var response = new BulkOperationResponse<StudentMarkResponse>();

            // Validate AssessmentItem exists
            var assessmentItem = await _assessmentItemRepository.GetByIdAsync(assessmentItemId);
            if (assessmentItem == null)
                throw new KeyNotFoundException("Assessment item not found");

            if (!assessmentItem.IsActive)
                throw new InvalidOperationException("Assessment item is not active");

            // Validate Grader exists
            if (!await _facultyRepository.ExistsAsync(graderId))
                throw new KeyNotFoundException("Grader (Faculty) not found");

            // Parse CSV
            var (records, parseErrors) = await CsvHelperService.ParseCsvWithErrorsAsync<StudentMarkCsvImportRequest>(csvStream);

            // Add parse errors
            foreach (var error in parseErrors)
            {
                response.Errors.Add(new BulkOperationError
                {
                    RowNumber = error.RowNumber,
                    ErrorMessage = $"CSV Parse Error: {error.ErrorMessage}",
                    Identifier = error.RawData
                });
            }

            response.TotalRecords = records.Count + parseErrors.Count;

            // Get course offering ID from assessment item
            var courseOfferingId = assessmentItem.EvaluationScheme.CourseOfferingId;

            int rowNumber = 1; // Start after header
            foreach (var record in records)
            {
                rowNumber++;
                var errors = new Dictionary<string, string>();

                try
                {
                    // Validate required fields
                    if (string.IsNullOrWhiteSpace(record.EnrollmentNumber))
                    {
                        errors["EnrollmentNumber"] = "Enrollment number is required";
                    }

                    // Find enrollment by student enrollment number and course offering
                    var enrollment = await _courseEnrollmentRepository
                        .GetByStudentEnrollmentNumberAndCourseOfferingAsync(record.EnrollmentNumber, courseOfferingId);

                    if (enrollment == null)
                    {
                        errors["EnrollmentNumber"] = $"Student '{record.EnrollmentNumber}' not enrolled in this course";
                    }
                    else
                    {
                        // Check if mark already exists
                        if (await _studentMarkRepository.MarkExistsForEnrollmentAndAssessmentAsync(
                            enrollment.Id, assessmentItemId))
                        {
                            errors["EnrollmentNumber"] = $"Mark already exists for student '{record.EnrollmentNumber}'";
                        }
                    }

                    // Validate marks
                    if (!record.IsAbsent && record.ObtainedMarks.HasValue)
                    {
                        if (record.ObtainedMarks.Value < 0)
                            errors["ObtainedMarks"] = "Obtained marks cannot be negative";

                        if (record.ObtainedMarks.Value > assessmentItem.MaxMarks)
                            errors["ObtainedMarks"] = $"Obtained marks ({record.ObtainedMarks}) exceed max marks ({assessmentItem.MaxMarks})";
                    }

                    if (record.IsAbsent && record.ObtainedMarks.HasValue)
                    {
                        errors["IsAbsent"] = "Cannot have marks when marked as absent";
                    }

                    if (errors.Count > 0)
                    {
                        response.Errors.Add(new BulkOperationError
                        {
                            RowNumber = rowNumber,
                            Identifier = record.EnrollmentNumber,
                            ErrorMessage = "Validation failed",
                            FieldErrors = errors
                        });
                        continue;
                    }

                    // Create student mark
                    var studentMark = new StudentMark
                    {
                        EnrollmentId = enrollment!.Id,
                        AssessmentItemId = assessmentItemId,
                        ObtainedMarks = record.IsAbsent ? null : record.ObtainedMarks,
                        IsAbsent = record.IsAbsent,
                        Remarks = record.Remarks,
                        GraderId = graderId,
                        GradedDate = DateTime.Now
                    };

                    await _studentMarkRepository.CreateAsync(studentMark);

                    // Reload with navigation properties
                    studentMark = await _studentMarkRepository.GetByIdAsync(studentMark.Id);

                    response.SuccessfulRecords.Add(new StudentMarkResponse
                    {
                        Id = studentMark!.Id,
                        EnrollmentId = studentMark.EnrollmentId,
                        StudentName = studentMark.Enrollment.Student.IdNavigation.FullName,
                        EnrollmentNumber = studentMark.Enrollment.Student.EnrollmentNumber,
                        AssessmentItemId = studentMark.AssessmentItemId,
                        AssessmentItemName = studentMark.AssessmentItem.Name,
                        AssessmentMaxMarks = studentMark.AssessmentItem.MaxMarks,
                        ObtainedMarks = studentMark.ObtainedMarks,
                        IsAbsent = studentMark.IsAbsent,
                        Remarks = studentMark.Remarks,
                        GraderId = studentMark.GraderId,
                        GraderName = studentMark.Grader.IdNavigation.FullName,
                        GradedDate = studentMark.GradedDate,
                        CreatedAt = studentMark.CreatedAt
                    });
                }
                catch (Exception ex)
                {
                    response.Errors.Add(new BulkOperationError
                    {
                        RowNumber = rowNumber,
                        Identifier = record.EnrollmentNumber,
                        ErrorMessage = ex.Message
                    });
                }
            }

            response.SuccessCount = response.SuccessfulRecords.Count;
            response.ErrorCount = response.Errors.Count;

            return response;
        }

        public async Task<byte[]> ExportGradesToCsvAsync(StudentMarkExportFilterRequest filter)
        {
            List<StudentMark> studentMarks;

            if (filter.AssessmentItemId.HasValue)
            {
                studentMarks = await _studentMarkRepository.GetByAssessmentItemIdAsync(filter.AssessmentItemId.Value);
            }
            else if (filter.CourseOfferingId.HasValue)
            {
                studentMarks = await _studentMarkRepository.GetByCourseOfferingIdAsync(filter.CourseOfferingId.Value);
            }
            else
            {
                // Get all with basic filter
                var filterRequest = new StudentMarkFilterRequest
                {
                    StudentId = filter.StudentId,
                    PageSize = int.MaxValue
                };
                var (marks, _) = await _studentMarkRepository.GetAllAsync(filterRequest);
                studentMarks = marks;
            }

            var exportData = studentMarks.Select(sm => new StudentMarkCsvExportResponse
            {
                Id = sm.Id,
                EnrollmentNumber = sm.Enrollment.Student.EnrollmentNumber,
                StudentName = sm.Enrollment.Student.IdNavigation.FullName,
                SubjectCode = sm.Enrollment.CourseOffering.Subject.Code,
                SubjectName = sm.Enrollment.CourseOffering.Subject.Name,
                AssessmentName = sm.AssessmentItem.Name,
                MaxMarks = sm.AssessmentItem.MaxMarks,
                ObtainedMarks = sm.ObtainedMarks,
                Percentage = sm.ObtainedMarks.HasValue 
                    ? Math.Round((sm.ObtainedMarks.Value / sm.AssessmentItem.MaxMarks) * 100, 2) 
                    : null,
                IsAbsent = sm.IsAbsent,
                Remarks = sm.Remarks,
                GradedBy = sm.Grader.IdNavigation.FullName,
                GradedDate = sm.GradedDate
            }).ToList();

            return await CsvHelperService.GenerateCsvAsync(exportData);
        }

        public async Task<byte[]> GetGradeTemplateAsync(int assessmentItemId)
        {
            // Validate AssessmentItem exists
            var assessmentItem = await _assessmentItemRepository.GetByIdAsync(assessmentItemId);
            if (assessmentItem == null)
                throw new KeyNotFoundException("Assessment item not found");

            // Get all enrolled students for this course offering
            var courseOfferingId = assessmentItem.EvaluationScheme.CourseOfferingId;
            var enrollments = await _courseEnrollmentRepository.GetByCourseOfferingIdAsync(courseOfferingId);

            // Create template with student data pre-filled
            var templateData = enrollments.Select(e => new GradeTemplateCsvResponse
            {
                EnrollmentNumber = e.Student.EnrollmentNumber,
                StudentName = e.Student.IdNavigation.FullName,
                ObtainedMarks = "", // Empty for teachers to fill
                IsAbsent = "false",
                Remarks = ""
            }).ToList();

            return await CsvHelperService.GenerateCsvAsync(templateData);
        }

        /// <summary>
        /// Validate grade import file and return preview with conflicts
        /// </summary>
        public async Task<BulkGradeValidationResponse> ValidateGradeImportAsync(int assessmentItemId, Stream fileStream, string fileType)
        {
            var response = new BulkGradeValidationResponse();

            // Validate AssessmentItem exists
            var assessmentItem = await _assessmentItemRepository.GetByIdAsync(assessmentItemId);
            if (assessmentItem == null)
                throw new KeyNotFoundException("Assessment item not found");

            var courseOfferingId = assessmentItem.EvaluationScheme.CourseOfferingId;

            // Parse file based on type
            List<GradeImportRowData> records;
            List<ExcelParseError> parseErrors;

            if (fileType.Equals(".xlsx", StringComparison.OrdinalIgnoreCase) || 
                fileType.Equals(".xls", StringComparison.OrdinalIgnoreCase))
            {
                (records, parseErrors) = ExcelHelperService.ParseGradeImportExcel(fileStream);
            }
            else
            {
                // CSV parsing using existing method
                var csvResult = await CsvHelperService.ParseCsvWithErrorsAsync<StudentMarkCsvImportRequest>(fileStream);
                records = csvResult.Records.Select((r, i) => new GradeImportRowData
                {
                    RowNumber = i + 2,
                    RollNumber = r.EnrollmentNumber,
                    MarksObtained = r.ObtainedMarks?.ToString() ?? "",
                    IsAbsent = r.IsAbsent,
                    Remarks = r.Remarks
                }).ToList();
                parseErrors = csvResult.Errors.Select(e => new ExcelParseError
                {
                    RowNumber = e.RowNumber,
                    RawData = e.RawData,
                    ErrorMessage = e.ErrorMessage
                }).ToList();
            }

            response.TotalRows = records.Count + parseErrors.Count;

            // Add parse errors
            foreach (var error in parseErrors)
            {
                response.Rows.Add(new GradeValidationRow
                {
                    RowNumber = error.RowNumber,
                    RollNumber = error.RawData ?? "",
                    IsValid = false,
                    Errors = new List<string> { error.ErrorMessage }
                });
                response.InvalidRows++;
            }

            // Validate each record
            foreach (var record in records)
            {
                var validationRow = new GradeValidationRow
                {
                    RowNumber = record.RowNumber,
                    RollNumber = record.RollNumber,
                    IsAbsent = record.IsAbsent,
                    Remarks = record.Remarks,
                    IsValid = true
                };

                // Validate roll number
                if (string.IsNullOrWhiteSpace(record.RollNumber))
                {
                    validationRow.Errors.Add("Roll number is required");
                    validationRow.IsValid = false;
                }
                else
                {
                    // Find enrollment
                    var enrollment = await _courseEnrollmentRepository
                        .GetByStudentEnrollmentNumberAndCourseOfferingAsync(record.RollNumber, courseOfferingId);

                    if (enrollment == null)
                    {
                        validationRow.Errors.Add($"Student '{record.RollNumber}' not enrolled in this course");
                        validationRow.IsValid = false;
                    }
                    else
                    {
                        validationRow.StudentId = enrollment.StudentId;
                        validationRow.EnrollmentId = enrollment.Id;
                        validationRow.StudentName = enrollment.Student.IdNavigation.FullName;

                        // Check for existing mark
                        var existingMark = await _studentMarkRepository
                            .GetByEnrollmentAndAssessmentAsync(enrollment.Id, assessmentItemId);
                        if (existingMark != null)
                        {
                            validationRow.HasConflict = true;
                            validationRow.ExistingMarks = existingMark.ObtainedMarks;
                        }
                    }
                }

                // Validate marks
                if (!record.IsAbsent)
                {
                    if (string.IsNullOrWhiteSpace(record.MarksObtained))
                    {
                        validationRow.Errors.Add("Marks are required (or mark as absent)");
                        validationRow.IsValid = false;
                    }
                    else if (decimal.TryParse(record.MarksObtained, out var marks))
                    {
                        validationRow.MarksObtained = marks;
                        if (marks < 0)
                        {
                            validationRow.Errors.Add("Marks cannot be negative");
                            validationRow.IsValid = false;
                        }
                        else if (marks > assessmentItem.MaxMarks)
                        {
                            validationRow.Errors.Add($"Marks ({marks}) exceed maximum ({assessmentItem.MaxMarks})");
                            validationRow.IsValid = false;
                        }
                    }
                    else
                    {
                        validationRow.Errors.Add("Invalid marks format");
                        validationRow.IsValid = false;
                    }
                }

                if (validationRow.IsValid)
                {
                    if (validationRow.HasConflict)
                        response.ConflictRows++;
                    else
                        response.ValidRows++;
                }
                else
                {
                    response.InvalidRows++;
                }

                response.Rows.Add(validationRow);
            }

            return response;
        }

        /// <summary>
        /// Import grades with conflict resolution
        /// </summary>
        public async Task<BulkOperationResponse<StudentMarkResponse>> ImportGradesWithValidationAsync(BulkGradeImportRequest request)
        {
            var response = new BulkOperationResponse<StudentMarkResponse>();

            // Validate AssessmentItem exists
            var assessmentItem = await _assessmentItemRepository.GetByIdAsync(request.AssessmentItemId);
            if (assessmentItem == null)
                throw new KeyNotFoundException("Assessment item not found");

            if (!assessmentItem.IsActive)
                throw new InvalidOperationException("Assessment item is not active");

            // Validate Grader exists
            if (!await _facultyRepository.ExistsAsync(request.GraderId))
                throw new KeyNotFoundException("Grader (Faculty) not found");

            var courseOfferingId = assessmentItem.EvaluationScheme.CourseOfferingId;
            response.TotalRecords = request.Rows.Count;

            foreach (var row in request.Rows)
            {
                try
                {
                    // Find enrollment
                    var enrollment = await _courseEnrollmentRepository
                        .GetByStudentEnrollmentNumberAndCourseOfferingAsync(row.RollNumber, courseOfferingId);

                    if (enrollment == null)
                    {
                        response.Errors.Add(new BulkOperationError
                        {
                            RowNumber = row.RowNumber,
                            Identifier = row.RollNumber,
                            ErrorMessage = "Student not found in this course"
                        });
                        continue;
                    }

                    // Check for existing mark
                    var existingMark = await _studentMarkRepository
                        .GetByEnrollmentAndAssessmentAsync(enrollment.Id, request.AssessmentItemId);

                    decimal? obtainedMarks = null;
                    if (!row.IsAbsent && !string.IsNullOrWhiteSpace(row.MarksObtained))
                    {
                        if (decimal.TryParse(row.MarksObtained, out var marks))
                            obtainedMarks = marks;
                    }

                    if (existingMark != null)
                    {
                        // Handle conflict based on resolution strategy
                        switch (request.ConflictResolution.ToLower())
                        {
                            case "skip":
                                response.Errors.Add(new BulkOperationError
                                {
                                    RowNumber = row.RowNumber,
                                    Identifier = row.RollNumber,
                                    ErrorMessage = "Skipped - marks already exist"
                                });
                                continue;

                            case "error":
                                response.Errors.Add(new BulkOperationError
                                {
                                    RowNumber = row.RowNumber,
                                    Identifier = row.RollNumber,
                                    ErrorMessage = "Conflict - marks already exist"
                                });
                                continue;

                            case "update":
                                existingMark.ObtainedMarks = obtainedMarks;
                                existingMark.IsAbsent = row.IsAbsent;
                                existingMark.Remarks = row.Remarks;
                                existingMark.GraderId = request.GraderId;
                                existingMark.GradedDate = DateTime.Now;
                                await _studentMarkRepository.UpdateAsync(existingMark);
                                existingMark = await _studentMarkRepository.GetByIdAsync(existingMark.Id);
                                break;
                        }
                    }
                    else
                    {
                        // Create new mark
                        var newMark = new StudentMark
                        {
                            EnrollmentId = enrollment.Id,
                            AssessmentItemId = request.AssessmentItemId,
                            ObtainedMarks = obtainedMarks,
                            IsAbsent = row.IsAbsent,
                            Remarks = row.Remarks,
                            GraderId = request.GraderId,
                            GradedDate = DateTime.Now
                        };
                        await _studentMarkRepository.CreateAsync(newMark);
                        existingMark = await _studentMarkRepository.GetByIdAsync(newMark.Id);
                    }

                    if (existingMark != null)
                    {
                        response.SuccessfulRecords.Add(new StudentMarkResponse
                        {
                            Id = existingMark.Id,
                            EnrollmentId = existingMark.EnrollmentId,
                            StudentName = existingMark.Enrollment.Student.IdNavigation.FullName,
                            EnrollmentNumber = existingMark.Enrollment.Student.EnrollmentNumber,
                            AssessmentItemId = existingMark.AssessmentItemId,
                            AssessmentItemName = existingMark.AssessmentItem.Name,
                            AssessmentMaxMarks = existingMark.AssessmentItem.MaxMarks,
                            ObtainedMarks = existingMark.ObtainedMarks,
                            IsAbsent = existingMark.IsAbsent,
                            Remarks = existingMark.Remarks,
                            GraderId = existingMark.GraderId,
                            GraderName = existingMark.Grader.IdNavigation.FullName,
                            GradedDate = existingMark.GradedDate,
                            CreatedAt = existingMark.CreatedAt
                        });
                    }
                }
                catch (Exception ex)
                {
                    response.Errors.Add(new BulkOperationError
                    {
                        RowNumber = row.RowNumber,
                        Identifier = row.RollNumber,
                        ErrorMessage = ex.Message
                    });
                }
            }

            response.SuccessCount = response.SuccessfulRecords.Count;
            response.ErrorCount = response.Errors.Count;

            return response;
        }

        /// <summary>
        /// Generate Excel template for grade import
        /// </summary>
        public async Task<byte[]> GetGradeTemplateExcelAsync(int assessmentItemId)
        {
            var assessmentItem = await _assessmentItemRepository.GetByIdAsync(assessmentItemId);
            if (assessmentItem == null)
                throw new KeyNotFoundException("Assessment item not found");

            var courseOfferingId = assessmentItem.EvaluationScheme.CourseOfferingId;
            var enrollments = await _courseEnrollmentRepository.GetByCourseOfferingIdAsync(courseOfferingId);

            var templateData = enrollments.Select(e => new
            {
                RollNumber = e.Student.EnrollmentNumber,
                StudentName = e.Student.IdNavigation.FullName,
                Marks = "",
                IsAbsent = "",
                Remarks = ""
            }).ToList();

            return ExcelHelperService.GenerateExcel(templateData, $"Grades - {assessmentItem.Name}");
        }

        #endregion
    }
}