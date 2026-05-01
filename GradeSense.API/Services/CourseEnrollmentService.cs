using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.CourseEnrollment.Request;
using GradeSense.API.DTOs.CourseEnrollment.Response;
using GradeSense.API.Helpers;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class CourseEnrollmentService : ICourseEnrollmentService
    {
        private readonly ICourseEnrollmentRepository _courseEnrollmentRepository;
        private readonly ICourseOfferingRepository _courseOfferingRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IStudentMarkRepository _studentMarkRepository;
        private readonly IAttendanceRecordRepository _attendanceRecordRepository;
        private readonly IPredictionRepository _predictionRepository;
        private readonly ILogger<CourseEnrollmentService> _logger;

        public CourseEnrollmentService(
            ICourseEnrollmentRepository courseEnrollmentRepository,
            ICourseOfferingRepository courseOfferingRepository,
            IStudentRepository studentRepository,
            IStudentMarkRepository studentMarkRepository,
            IAttendanceRecordRepository attendanceRecordRepository,
            IPredictionRepository predictionRepository,
            ILogger<CourseEnrollmentService> logger)
        {
            _courseEnrollmentRepository = courseEnrollmentRepository;
            _courseOfferingRepository = courseOfferingRepository;
            _studentRepository = studentRepository;
            _studentMarkRepository = studentMarkRepository;
            _attendanceRecordRepository = attendanceRecordRepository;
            _predictionRepository = predictionRepository;
            _logger = logger;
        }

        public async Task<PagedResponse<CourseEnrollmentListResponse>> GetAllAsync(CourseEnrollmentFilterRequest filter)
        {
            var (courseEnrollments, total) = await _courseEnrollmentRepository.GetAllAsync(filter);

            // Get enrollment IDs to fetch marks
            var enrollmentIds = courseEnrollments.Select(ce => ce.Id).ToList();
            
            // Bulk fetch marks for all enrollments
            var marksLookup = new Dictionary<int, decimal>();
            if (enrollmentIds.Any())
            {
                var allMarks = await _studentMarkRepository.GetByEnrollmentIdsAsync(enrollmentIds);
                foreach (var enrollmentId in enrollmentIds)
                {
                    var enrollmentMarks = allMarks
                        .Where(m => m.EnrollmentId == enrollmentId && m.DeletedAt == null)
                        .ToList();
                    if (enrollmentMarks.Any())
                    {
                        // Calculate percentage: sum(obtained/max * 100) / count
                        var avgPercentage = enrollmentMarks
                            .Where(m => m.AssessmentItem.MaxMarks > 0)
                            .Select(m => (m.ObtainedMarks / m.AssessmentItem.MaxMarks) * 100)
                            .DefaultIfEmpty(0)
                            .Average();

                        // Fix: avgPercentage may be nullable, so use ?? 0m to ensure decimal
                        marksLookup[enrollmentId] = Math.Round(avgPercentage ?? 0m, 1);
                    }
                }
            }

            var data = courseEnrollments.Select(ce => new CourseEnrollmentListResponse
            {
                Id = ce.Id,
                StudentId = ce.StudentId,
                CourseOfferingId = ce.CourseOfferingId,
                SubjectCode = ce.CourseOffering.Subject.Code,
                SubjectName = ce.CourseOffering.Subject.Name,
                SubjectDescription = ce.CourseOffering.Subject.Description,
                Credits = ce.CourseOffering.Subject.Credit,
                BatchName = ce.CourseOffering.Batch.Name,
                Semester = ce.CourseOffering.Batch.Semester,
                AcademicYear = ce.CourseOffering.AcademicYear,
                FacultyName = ce.CourseOffering.SubjectCoordinator?.IdNavigation?.FullName,
                IsActive = ce.CourseOffering.IsActive,
                StudentName = ce.Student.IdNavigation.FullName,
                EnrollmentNumber = ce.Student.EnrollmentNumber,
                RollNumber = ce.RollNumber,
                PersonalEmail = ce.Student.IdNavigation.PersonalEmail,
                PhoneNumber = ce.Student.IdNavigation.PhoneNumber,
                DepartmentId = ce.Student.DepartmentId,
                DepartmentName = ce.Student.Department?.Name,
                EnrollmentDate = ce.EnrollmentDate,
                Status = ce.Status,
                AttendancePercentage = ce.AttendancePercentage,
                AverageScore = marksLookup.TryGetValue(ce.Id, out var avg) ? avg : 0,
                Grade = ce.Grade,
                CreatedAt = ce.CreatedAt
            }).ToList();

            return new PagedResponse<CourseEnrollmentListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<CourseEnrollmentDetailResponse?> GetByIdAsync(int id)
        {
            var courseEnrollment = await _courseEnrollmentRepository.GetByIdAsync(id);
            if (courseEnrollment == null) return null;

            return new CourseEnrollmentDetailResponse
            {
                Id = courseEnrollment.Id,
                CourseOfferingId = courseEnrollment.CourseOfferingId,
                SubjectCode = courseEnrollment.CourseOffering.Subject.Code,
                SubjectName = courseEnrollment.CourseOffering.Subject.Name,
                SubjectCredit = courseEnrollment.CourseOffering.Subject.Credit,
                BatchName = courseEnrollment.CourseOffering.Batch.Name,
                BatchSemester = courseEnrollment.CourseOffering.Batch.Semester,
                DepartmentName = courseEnrollment.CourseOffering.Subject.Department.Name,
                AcademicYear = courseEnrollment.CourseOffering.AcademicYear,
                StudentId = courseEnrollment.StudentId,
                StudentName = courseEnrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = courseEnrollment.Student.EnrollmentNumber,
                StudentEmail = courseEnrollment.Student.IdNavigation.PersonalEmail,
                RollNumber = courseEnrollment.RollNumber,
                EnrollmentDate = courseEnrollment.EnrollmentDate,
                Status = courseEnrollment.Status,
                AttendancePercentage = courseEnrollment.AttendancePercentage,
                Grade = courseEnrollment.Grade,
                GradePoints = courseEnrollment.GradePoints,
                CreatedAt = courseEnrollment.CreatedAt,
                UpdatedAt = courseEnrollment.UpdatedAt,
                DeletedAt = courseEnrollment.DeletedAt,
                StudentMarksCount = await _courseEnrollmentRepository.GetStudentMarksCountAsync(id),
                AttendanceRecordsCount = await _courseEnrollmentRepository.GetAttendanceRecordsCountAsync(id),
                PredictionsCount = await _courseEnrollmentRepository.GetPredictionsCountAsync(id)
            };
        }

        public async Task<CourseEnrollmentResponse> CreateAsync(CreateCourseEnrollmentRequest request)
        {
            // Validate CourseOffering exists
            var courseOffering = await _courseOfferingRepository.GetByIdAsync(request.CourseOfferingId);
            if (courseOffering == null)
                throw new KeyNotFoundException("Course offering not found");

            if (!courseOffering.IsActive)
                throw new InvalidOperationException("Course offering is not active");

            // Validate Student exists
            var student = await _studentRepository.GetByIdAsync(request.StudentId);
            if (student == null)
                throw new KeyNotFoundException("Student not found");

            if (student.Status != "Active")
                throw new InvalidOperationException("Student is not active");

            // Check if student already enrolled in this course
            if (await _courseEnrollmentRepository.StudentAlreadyEnrolledAsync(request.CourseOfferingId, request.StudentId))
                throw new InvalidOperationException("Student is already enrolled in this course offering");

            // Validate RollNumber uniqueness per course if provided
            if (!string.IsNullOrEmpty(request.RollNumber) &&
                await _courseEnrollmentRepository.RollNumberExistsForCourseAsync(request.CourseOfferingId, request.RollNumber))
            {
                throw new InvalidOperationException($"Roll number '{request.RollNumber}' already exists for this course offering");
            }

            // Check max enrollment limit
            if (courseOffering.MaxEnrollment.HasValue)
            {
                var currentEnrollments = await _courseOfferingRepository.GetActiveEnrollmentsCountAsync(request.CourseOfferingId);
                if (currentEnrollments >= courseOffering.MaxEnrollment.Value)
                {
                    throw new InvalidOperationException($"Course offering has reached maximum enrollment limit of {courseOffering.MaxEnrollment.Value}");
                }
            }

            var courseEnrollment = new CourseEnrollment
            {
                CourseOfferingId = request.CourseOfferingId,
                StudentId = request.StudentId,
                RollNumber = request.RollNumber,
                EnrollmentDate = request.EnrollmentDate ?? DateTime.Now,
                Status = request.Status,
                AttendancePercentage = request.AttendancePercentage,
                Grade = request.Grade,
                GradePoints = request.GradePoints
            };

            await _courseEnrollmentRepository.CreateAsync(courseEnrollment);

            // Reload with navigation properties
            courseEnrollment = await _courseEnrollmentRepository.GetByIdAsync(courseEnrollment.Id);

            return new CourseEnrollmentResponse
            {
                Id = courseEnrollment!.Id,
                CourseOfferingId = courseEnrollment.CourseOfferingId,
                SubjectCode = courseEnrollment.CourseOffering.Subject.Code,
                SubjectName = courseEnrollment.CourseOffering.Subject.Name,
                BatchName = courseEnrollment.CourseOffering.Batch.Name,
                StudentId = courseEnrollment.StudentId,
                StudentName = courseEnrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = courseEnrollment.Student.EnrollmentNumber,
                RollNumber = courseEnrollment.RollNumber,
                PersonalEmail = courseEnrollment.Student.IdNavigation.PersonalEmail,
                PhoneNumber = courseEnrollment.Student.IdNavigation.PhoneNumber,
                EnrollmentDate = courseEnrollment.EnrollmentDate,
                Status = courseEnrollment.Status,
                AttendancePercentage = courseEnrollment.AttendancePercentage,
                Grade = courseEnrollment.Grade,
                GradePoints = courseEnrollment.GradePoints,
                CreatedAt = courseEnrollment.CreatedAt,
                UpdatedAt = courseEnrollment.UpdatedAt
            };
        }

        public async Task<CourseEnrollmentResponse> UpdateAsync(int id, UpdateCourseEnrollmentRequest request)
        {
            var courseEnrollment = await _courseEnrollmentRepository.GetByIdAsync(id);
            if (courseEnrollment == null)
                throw new KeyNotFoundException("Course enrollment not found");

            // Validate RollNumber uniqueness if being changed
            if (!string.IsNullOrEmpty(request.RollNumber) &&
                request.RollNumber != courseEnrollment.RollNumber &&
                await _courseEnrollmentRepository.RollNumberExistsForCourseAsync(
                    courseEnrollment.CourseOfferingId, request.RollNumber, id))
            {
                throw new InvalidOperationException($"Roll number '{request.RollNumber}' already exists for this course offering");
            }

            // Update fields if provided
            courseEnrollment.RollNumber = request.RollNumber ?? courseEnrollment.RollNumber;

            if (!string.IsNullOrEmpty(request.Status))
                courseEnrollment.Status = request.Status;

            courseEnrollment.AttendancePercentage = request.AttendancePercentage ?? courseEnrollment.AttendancePercentage;
            courseEnrollment.Grade = request.Grade ?? courseEnrollment.Grade;
            courseEnrollment.GradePoints = request.GradePoints ?? courseEnrollment.GradePoints;

            await _courseEnrollmentRepository.UpdateAsync(courseEnrollment);

            // Reload with navigation properties
            courseEnrollment = await _courseEnrollmentRepository.GetByIdAsync(id);

            return new CourseEnrollmentResponse
            {
                Id = courseEnrollment!.Id,
                CourseOfferingId = courseEnrollment.CourseOfferingId,
                SubjectCode = courseEnrollment.CourseOffering.Subject.Code,
                SubjectName = courseEnrollment.CourseOffering.Subject.Name,
                BatchName = courseEnrollment.CourseOffering.Batch.Name,
                StudentId = courseEnrollment.StudentId,
                StudentName = courseEnrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = courseEnrollment.Student.EnrollmentNumber,
                RollNumber = courseEnrollment.RollNumber,
                PersonalEmail = courseEnrollment.Student.IdNavigation.PersonalEmail,
                PhoneNumber = courseEnrollment.Student.IdNavigation.PhoneNumber,
                EnrollmentDate = courseEnrollment.EnrollmentDate,
                Status = courseEnrollment.Status,
                AttendancePercentage = courseEnrollment.AttendancePercentage,
                Grade = courseEnrollment.Grade,
                GradePoints = courseEnrollment.GradePoints,
                CreatedAt = courseEnrollment.CreatedAt,
                UpdatedAt = courseEnrollment.UpdatedAt
            };
        }

        public async Task<BulkEnrollResponse> BulkEnrollAsync(BulkEnrollRequest request)
        {
            var response = new BulkEnrollResponse
            {
                TotalRequested = request.StudentIds.Count
            };

            // Validate CourseOffering exists
            var courseOffering = await _courseOfferingRepository.GetByIdAsync(request.CourseOfferingId);
            if (courseOffering == null)
            {
                response.Errors.Add("Course offering not found");
                response.FailedEnrollments = request.StudentIds.Count;
                return response;
            }

            if (!courseOffering.IsActive)
            {
                response.Errors.Add("Course offering is not active");
                response.FailedEnrollments = request.StudentIds.Count;
                return response;
            }

            foreach (var studentId in request.StudentIds)
            {
                try
                {
                    // Check if student exists
                    if (!await _studentRepository.ExistsAsync(studentId))
                    {
                        response.Errors.Add($"Student ID {studentId} not found");
                        response.FailedEnrollments++;
                        continue;
                    }

                    // Check if student already enrolled
                    if (await _courseEnrollmentRepository.StudentAlreadyEnrolledAsync(request.CourseOfferingId, studentId))
                    {
                        response.Errors.Add($"Student ID {studentId} already enrolled");
                        response.FailedEnrollments++;
                        continue;
                    }

                    // Create enrollment
                    var enrollment = new CourseEnrollment
                    {
                        CourseOfferingId = request.CourseOfferingId,
                        StudentId = studentId,
                        EnrollmentDate = DateTime.Now,
                        Status = "Active"
                    };

                    await _courseEnrollmentRepository.CreateAsync(enrollment);
                    response.SuccessfulEnrollments++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error enrolling student {StudentId}", studentId);
                    response.Errors.Add($"Error enrolling student ID {studentId}: {ex.Message}");
                    response.FailedEnrollments++;
                }
            }

            return response;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _courseEnrollmentRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Course enrollment not found");

            // Cascade delete student marks
            var deletedMarks = await _studentMarkRepository.DeleteByEnrollmentIdAsync(id);
            if (deletedMarks > 0)
                _logger.LogInformation("Cascade deleted {Count} student mark(s) for enrollment {EnrollmentId}", deletedMarks, id);

            // Cascade delete attendance records
            var deletedAttendance = await _attendanceRecordRepository.DeleteByEnrollmentIdAsync(id);
            if (deletedAttendance > 0)
                _logger.LogInformation("Cascade deleted {Count} attendance record(s) for enrollment {EnrollmentId}", deletedAttendance, id);

            // Cascade delete predictions
            var deletedPredictions = await _predictionRepository.DeleteByEnrollmentIdAsync(id);
            if (deletedPredictions > 0)
                _logger.LogInformation("Cascade deleted {Count} prediction(s) for enrollment {EnrollmentId}", deletedPredictions, id);

            return await _courseEnrollmentRepository.DeleteAsync(id);
        }

        #region Bulk Import Methods

        /// <summary>
        /// Generate Excel template for enrollment import
        /// </summary>
        public async Task<byte[]> GetEnrollmentTemplateExcelAsync(int courseOfferingId)
        {
            var courseOffering = await _courseOfferingRepository.GetByIdAsync(courseOfferingId);
            if (courseOffering == null)
                throw new KeyNotFoundException("Course offering not found");

            // Create template with sample rows
            var templateData = new[]
            {
                new { RollNumber = "21CE001" }, // Example row
                new { RollNumber = "21CE002" }  // Example row
            };

            return ExcelHelperService.GenerateExcel(templateData, $"Enrollment - {courseOffering.Subject.Code}");
        }

        /// <summary>
        /// Validate enrollment import file and return preview
        /// </summary>
        public async Task<BulkEnrollmentValidationResponse> ValidateEnrollmentImportAsync(
            int courseOfferingId, Stream stream, string extension)
        {
            var response = new BulkEnrollmentValidationResponse();

            // Validate course offering exists
            var courseOffering = await _courseOfferingRepository.GetByIdAsync(courseOfferingId);
            if (courseOffering == null)
                throw new KeyNotFoundException("Course offering not found");

            // Parse file
            List<EnrollmentImportRowData> records;
            List<(int RowNumber, string? RawData, string ErrorMessage)> parseErrors = new();

            if (extension == ".csv")
            {
                var (csvRecords, csvErrors) = CsvHelperService.ParseEnrollmentImportCsv(stream);
                records = csvRecords;
                parseErrors = csvErrors.Select(e => (e.RowNumber, e.RawData, e.ErrorMessage)).ToList();
            }
            else
            {
                var (excelRecords, excelErrors) = ExcelHelperService.ParseEnrollmentImportExcel(stream);
                records = excelRecords;
                parseErrors = excelErrors.Select(e => (e.RowNumber, e.RawData, e.ErrorMessage)).ToList();
            }

            response.TotalRows = records.Count + parseErrors.Count;

            // Add parse errors to response
            foreach (var error in parseErrors)
            {
                response.Rows.Add(new EnrollmentValidationRow
                {
                    RowNumber = error.RowNumber,
                    RollNumber = error.RawData ?? "",
                    IsValid = false,
                    Errors = new List<string> { error.ErrorMessage }
                });
                response.InvalidRows++;
            }

            // Fetch all students for matching (more efficient than individual lookups)
            var allStudents = await _studentRepository.GetAllStudentsForLookupAsync();

            // Fetch existing enrollments for this course offering
            var existingEnrollments = await _courseEnrollmentRepository.GetByCourseOfferingIdAsync(courseOfferingId);

            // Validate each record
            foreach (var record in records)
            {
                var validationRow = new EnrollmentValidationRow
                {
                    RowNumber = record.RowNumber,
                    RollNumber = record.RollNumber,
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
                    // Find student by enrollment number
                    var student = allStudents.FirstOrDefault(s =>
                        s.EnrollmentNumber.Equals(record.RollNumber, StringComparison.OrdinalIgnoreCase));

                    if (student == null)
                    {
                        validationRow.Errors.Add($"Student '{record.RollNumber}' not found");
                        validationRow.IsValid = false;
                    }
                    else
                    {
                        validationRow.StudentId = student.Id;
                        validationRow.StudentName = student.IdNavigation?.FullName;
                        validationRow.StudentEmail = student.IdNavigation?.PersonalEmail;
                        validationRow.DepartmentName = student.Department?.Name;
                        validationRow.BatchName = courseOffering.Batch?.Name;

                        // Check if student already enrolled
                        var existingEnrollment = existingEnrollments.FirstOrDefault(e =>
                            e.StudentId == student.Id && e.DeletedAt == null);

                        if (existingEnrollment != null)
                        {
                            validationRow.HasConflict = true;
                            validationRow.ExistingEnrollmentId = existingEnrollment.Id;
                            validationRow.ExistingStatus = existingEnrollment.Status;
                        }
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
        /// Import enrollments with conflict resolution
        /// </summary>
        public async Task<BulkOperationResponse<CourseEnrollmentResponse>> ImportEnrollmentsWithValidationAsync(
            BulkEnrollmentImportRequest request)
        {
            var response = new BulkOperationResponse<CourseEnrollmentResponse>();

            // Validate course offering
            var courseOffering = await _courseOfferingRepository.GetByIdAsync(request.CourseOfferingId);
            if (courseOffering == null)
                throw new KeyNotFoundException("Course offering not found");

            response.TotalRecords = request.Rows.Count;

            // Fetch all students for matching
            var allStudents = await _studentRepository.GetAllStudentsForLookupAsync();

            // Fetch existing enrollments for this course offering
            var existingEnrollments = await _courseEnrollmentRepository.GetByCourseOfferingIdAsync(request.CourseOfferingId);

            foreach (var row in request.Rows)
            {
                try
                {
                    // Find student
                    var student = allStudents.FirstOrDefault(s =>
                        s.EnrollmentNumber.Equals(row.RollNumber, StringComparison.OrdinalIgnoreCase));

                    if (student == null)
                    {
                        response.Errors.Add(new BulkOperationError
                        {
                            RowNumber = row.RowNumber,
                            Identifier = row.RollNumber,
                            ErrorMessage = "Student not found"
                        });
                        continue;
                    }

                    // Check for existing enrollment
                    var existingEnrollment = existingEnrollments.FirstOrDefault(e =>
                        e.StudentId == student.Id && e.DeletedAt == null);

                    CourseEnrollment? finalEnrollment = null;

                    if (existingEnrollment != null)
                    {
                        // Handle conflict
                        switch (request.ConflictResolution.ToLower())
                        {
                            case "skip":
                                response.Errors.Add(new BulkOperationError
                                {
                                    RowNumber = row.RowNumber,
                                    Identifier = row.RollNumber,
                                    ErrorMessage = "Skipped - student already enrolled"
                                });
                                continue;

                            case "error":
                                response.Errors.Add(new BulkOperationError
                                {
                                    RowNumber = row.RowNumber,
                                    Identifier = row.RollNumber,
                                    ErrorMessage = "Conflict - student already enrolled"
                                });
                                continue;

                            case "update":
                                // Re-activate enrollment if it was inactive
                                if (existingEnrollment.Status != "Active")
                                {
                                    existingEnrollment.Status = "Active";
                                    existingEnrollment.UpdatedAt = DateTime.UtcNow;
                                    await _courseEnrollmentRepository.UpdateAsync(existingEnrollment);
                                    finalEnrollment = existingEnrollment;
                                }
                                else
                                {
                                    response.Errors.Add(new BulkOperationError
                                    {
                                        RowNumber = row.RowNumber,
                                        Identifier = row.RollNumber,
                                        ErrorMessage = "Student already actively enrolled"
                                    });
                                    continue;
                                }
                                break;
                        }
                    }
                    else
                    {
                        // Create new enrollment
                        var newEnrollment = new CourseEnrollment
                        {
                            CourseOfferingId = request.CourseOfferingId,
                            StudentId = student.Id,
                            EnrollmentDate = DateTime.UtcNow,
                            Status = "Active",
                            CreatedAt = DateTime.UtcNow
                        };
                        await _courseEnrollmentRepository.CreateAsync(newEnrollment);
                        finalEnrollment = await _courseEnrollmentRepository.GetByIdAsync(newEnrollment.Id);
                    }

                    if (finalEnrollment != null)
                    {
                        response.SuccessfulRecords.Add(new CourseEnrollmentResponse
                        {
                            Id = finalEnrollment.Id,
                            StudentId = finalEnrollment.StudentId,
                            CourseOfferingId = finalEnrollment.CourseOfferingId,
                            EnrollmentDate = finalEnrollment.EnrollmentDate,
                            Status = finalEnrollment.Status,
                            CreatedAt = finalEnrollment.CreatedAt
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

        #endregion
    }
}