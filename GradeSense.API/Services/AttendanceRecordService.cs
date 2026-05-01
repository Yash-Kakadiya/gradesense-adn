using GradeSense.API.DTOs.AttendanceRecord.Request;
using GradeSense.API.DTOs.AttendanceRecord.Response;
using GradeSense.API.DTOs.Common;
using GradeSense.API.Helpers;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;
using static GradeSense.API.Helpers.ExcelHelperService;

namespace GradeSense.API.Services
{
    public class AttendanceRecordService : IAttendanceRecordService
    {
        private readonly IAttendanceRecordRepository _attendanceRecordRepository;
        private readonly ICourseEnrollmentRepository _courseEnrollmentRepository;
        private readonly IFacultyRepository _facultyRepository;
        private readonly ILogger<AttendanceRecordService> _logger;

        public AttendanceRecordService(
            IAttendanceRecordRepository attendanceRecordRepository,
            ICourseEnrollmentRepository courseEnrollmentRepository,
            IFacultyRepository facultyRepository,
            ILogger<AttendanceRecordService> logger)
        {
            _attendanceRecordRepository = attendanceRecordRepository;
            _courseEnrollmentRepository = courseEnrollmentRepository;
            _facultyRepository = facultyRepository;
            _logger = logger;
        }

        public async Task<PagedResponse<AttendanceRecordListResponse>> GetAllAsync(AttendanceRecordFilterRequest filter)
        {
            var (attendanceRecords, total) = await _attendanceRecordRepository.GetAllAsync(filter);

            var data = attendanceRecords.Select(ar => new AttendanceRecordListResponse
            {
                Id = ar.Id,
                StudentId = ar.Enrollment.StudentId,
                EnrollmentId = ar.EnrollmentId,
                CourseOfferingId = ar.Enrollment.CourseOfferingId,
                StudentName = ar.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = ar.Enrollment.Student.EnrollmentNumber,
                SubjectCode = ar.Enrollment.CourseOffering.Subject.Code,
                AttendanceDate = ar.AttendanceDate,
                Status = ar.Status,
                RecordedByName = ar.RecordedByNavigation?.IdNavigation.FullName,
                CreatedAt = ar.CreatedAt
            }).ToList();

            return new PagedResponse<AttendanceRecordListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<AttendanceRecordDetailResponse?> GetByIdAsync(int id)
        {
            var attendanceRecord = await _attendanceRecordRepository.GetByIdAsync(id);
            if (attendanceRecord == null) return null;

            return new AttendanceRecordDetailResponse
            {
                Id = attendanceRecord.Id,
                EnrollmentId = attendanceRecord.EnrollmentId,
                StudentName = attendanceRecord.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = attendanceRecord.Enrollment.Student.EnrollmentNumber,
                StudentEmail = attendanceRecord.Enrollment.Student.IdNavigation.PersonalEmail,
                StudentId = attendanceRecord.Enrollment.StudentId,
                CourseOfferingId = attendanceRecord.Enrollment.CourseOfferingId,
                SubjectCode = attendanceRecord.Enrollment.CourseOffering.Subject.Code,
                SubjectName = attendanceRecord.Enrollment.CourseOffering.Subject.Name,
                BatchName = attendanceRecord.Enrollment.CourseOffering.Batch.Name,
                DepartmentName = attendanceRecord.Enrollment.CourseOffering.Subject.Department.Name,
                AttendanceDate = attendanceRecord.AttendanceDate,
                Status = attendanceRecord.Status,
                RecordedBy = attendanceRecord.RecordedBy,
                RecordedByName = attendanceRecord.RecordedByNavigation?.IdNavigation.FullName,
                RecordedByEmployeeId = attendanceRecord.RecordedByNavigation?.EmployeeId,
                Remarks = attendanceRecord.Remarks,
                CreatedAt = attendanceRecord.CreatedAt,
                UpdatedAt = attendanceRecord.UpdatedAt,
                DeletedAt = attendanceRecord.DeletedAt
            };
        }

        public async Task<AttendanceRecordResponse> CreateAsync(CreateAttendanceRecordRequest request)
        {
            // Validate Enrollment exists
            var enrollment = await _courseEnrollmentRepository.GetByIdAsync(request.EnrollmentId);
            if (enrollment == null)
                throw new KeyNotFoundException("Course enrollment not found");

            if (enrollment.Status != "Active")
            {
                _logger.LogWarning(
                    "Attendance record created for non-active enrollment {EnrollmentId} with status {Status}",
                    request.EnrollmentId, enrollment.Status);
            }

            // Validate RecordedBy exists if provided
            if (request.RecordedBy.HasValue &&
                !await _facultyRepository.ExistsAsync(request.RecordedBy.Value))
            {
                throw new KeyNotFoundException("Faculty (RecordedBy) not found");
            }

            // Check for duplicate attendance
            if (await _attendanceRecordRepository.AttendanceExistsForDateAsync(request.EnrollmentId, request.AttendanceDate))
            {
                throw new InvalidOperationException(
                    $"Attendance record already exists for this enrollment on {request.AttendanceDate:yyyy-MM-dd}");
            }

            // Soft validation: Check if attendance date is within course offering dates
            if (enrollment.CourseOffering.StartDate.HasValue &&
                request.AttendanceDate < enrollment.CourseOffering.StartDate.Value)
            {
                _logger.LogWarning(
                    "Attendance date {AttendanceDate} is before course start date {StartDate}",
                    request.AttendanceDate, enrollment.CourseOffering.StartDate);
            }

            if (enrollment.CourseOffering.EndDate.HasValue &&
                request.AttendanceDate > enrollment.CourseOffering.EndDate.Value)
            {
                _logger.LogWarning(
                    "Attendance date {AttendanceDate} is after course end date {EndDate}",
                    request.AttendanceDate, enrollment.CourseOffering.EndDate);
            }

            var attendanceRecord = new AttendanceRecord
            {
                EnrollmentId = request.EnrollmentId,
                AttendanceDate = request.AttendanceDate,
                Status = request.Status,
                RecordedBy = request.RecordedBy,
                Remarks = request.Remarks
            };

            await _attendanceRecordRepository.CreateAsync(attendanceRecord);

            // Reload with navigation properties
            attendanceRecord = await _attendanceRecordRepository.GetByIdAsync(attendanceRecord.Id);

            return new AttendanceRecordResponse
            {
                Id = attendanceRecord!.Id,
                EnrollmentId = attendanceRecord.EnrollmentId,
                StudentId = attendanceRecord.Enrollment.StudentId,
                StudentName = attendanceRecord.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = attendanceRecord.Enrollment.Student.EnrollmentNumber,
                SubjectCode = attendanceRecord.Enrollment.CourseOffering.Subject.Code,
                SubjectName = attendanceRecord.Enrollment.CourseOffering.Subject.Name,
                AttendanceDate = attendanceRecord.AttendanceDate,
                Status = attendanceRecord.Status,
                RecordedBy = attendanceRecord.RecordedBy,
                RecordedByName = attendanceRecord.RecordedByNavigation?.IdNavigation.FullName,
                Remarks = attendanceRecord.Remarks,
                CreatedAt = attendanceRecord.CreatedAt,
                UpdatedAt = attendanceRecord.UpdatedAt
            };
        }

        public async Task<AttendanceRecordResponse> UpdateAsync(int id, UpdateAttendanceRecordRequest request)
        {
            var attendanceRecord = await _attendanceRecordRepository.GetByIdAsync(id);
            if (attendanceRecord == null)
                throw new KeyNotFoundException("Attendance record not found");

            // Validate RecordedBy exists if being changed
            if (request.RecordedBy.HasValue &&
                !await _facultyRepository.ExistsAsync(request.RecordedBy.Value))
            {
                throw new KeyNotFoundException("Faculty (RecordedBy) not found");
            }

            // Check for duplicate attendance if date is being changed
            if (request.AttendanceDate.HasValue &&
                request.AttendanceDate.Value != attendanceRecord.AttendanceDate &&
                await _attendanceRecordRepository.AttendanceExistsForDateAsync(
                    attendanceRecord.EnrollmentId, request.AttendanceDate.Value, id))
            {
                throw new InvalidOperationException(
                    $"Attendance record already exists for this enrollment on {request.AttendanceDate.Value:yyyy-MM-dd}");
            }

            // Update fields if provided
            if (request.AttendanceDate.HasValue)
                attendanceRecord.AttendanceDate = request.AttendanceDate.Value;

            if (!string.IsNullOrEmpty(request.Status))
                attendanceRecord.Status = request.Status;

            if (request.RecordedBy != null)
                attendanceRecord.RecordedBy = request.RecordedBy;

            attendanceRecord.Remarks = request.Remarks ?? attendanceRecord.Remarks;

            await _attendanceRecordRepository.UpdateAsync(attendanceRecord);

            // Reload with navigation properties
            attendanceRecord = await _attendanceRecordRepository.GetByIdAsync(id);

            return new AttendanceRecordResponse
            {
                Id = attendanceRecord!.Id,
                EnrollmentId = attendanceRecord.EnrollmentId,
                StudentId = attendanceRecord.Enrollment.StudentId,
                StudentName = attendanceRecord.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = attendanceRecord.Enrollment.Student.EnrollmentNumber,
                SubjectCode = attendanceRecord.Enrollment.CourseOffering.Subject.Code,
                SubjectName = attendanceRecord.Enrollment.CourseOffering.Subject.Name,
                AttendanceDate = attendanceRecord.AttendanceDate,
                Status = attendanceRecord.Status,
                RecordedBy = attendanceRecord.RecordedBy,
                RecordedByName = attendanceRecord.RecordedByNavigation?.IdNavigation.FullName,
                Remarks = attendanceRecord.Remarks,
                CreatedAt = attendanceRecord.CreatedAt,
                UpdatedAt = attendanceRecord.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _attendanceRecordRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Attendance record not found");

            // Optional: Prevent deletion of old records
            var attendanceRecord = await _attendanceRecordRepository.GetByIdAsync(id);
            if (attendanceRecord != null)
            {
                var daysSinceRecord = (DateTime.Now.Date - attendanceRecord.AttendanceDate.ToDateTime(TimeOnly.MinValue)).Days;
                if (daysSinceRecord > 30)
                {
                    _logger.LogWarning(
                        "Attempting to delete attendance record {AttendanceRecordId} that is {Days} days old",
                        id, daysSinceRecord);
                }
            }

            return await _attendanceRecordRepository.DeleteAsync(id);
        }

        public async Task<BulkAttendanceResponse> BulkMarkAsync(BulkAttendanceRequest request)
        {
            var response = new BulkAttendanceResponse
            {
                TotalRequested = request.Records.Count
            };

            // Validate course offering exists
            var enrollments = await _courseEnrollmentRepository.GetByCourseOfferingIdAsync(request.CourseOfferingId);
            if (enrollments == null || enrollments.Count == 0)
            {
                throw new KeyNotFoundException("Course offering not found or has no enrollments");
            }

            // Validate faculty exists
            if (!await _facultyRepository.ExistsAsync(request.MarkedById))
            {
                throw new KeyNotFoundException("Faculty not found");
            }

            var validStatuses = new[] { "Present", "Absent", "Late", "Excused" };
            var dateOnly = DateOnly.FromDateTime(request.Date);

            foreach (var entry in request.Records)
            {
                try
                {
                    // Validate status
                    if (!validStatuses.Contains(entry.Status))
                    {
                        response.FailedEntries++;
                        response.Errors.Add($"Invalid status '{entry.Status}' for student {entry.StudentId}");
                        continue;
                    }

                    // Find enrollment for this student in this course
                    var enrollment = enrollments.FirstOrDefault(e => e.StudentId == entry.StudentId);
                    if (enrollment == null)
                    {
                        response.FailedEntries++;
                        response.Errors.Add($"Student {entry.StudentId} is not enrolled in this course");
                        continue;
                    }

                    // Check for existing attendance record for this date
                    var existingRecord = await _attendanceRecordRepository.FindByEnrollmentAndDateAsync(
                        enrollment.Id, dateOnly);

                    if (existingRecord != null)
                    {
                        // Update existing record
                        existingRecord.Status = entry.Status;
                        existingRecord.Remarks = entry.Remarks;
                        existingRecord.RecordedBy = request.MarkedById;
                        existingRecord.UpdatedAt = DateTime.UtcNow;
                        await _attendanceRecordRepository.UpdateAsync(existingRecord);
                    }
                    else
                    {
                        // Create new record
                        var newRecord = new AttendanceRecord
                        {
                            EnrollmentId = enrollment.Id,
                            AttendanceDate = dateOnly,
                            Status = entry.Status,
                            Remarks = entry.Remarks,
                            RecordedBy = request.MarkedById,
                            CreatedAt = DateTime.UtcNow
                        };
                        await _attendanceRecordRepository.CreateAsync(newRecord);
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

        #region Excel Import Operations

        /// <summary>
        /// Validate attendance import file and return preview with conflicts
        /// </summary>
        public async Task<BulkAttendanceValidationResponse> ValidateAttendanceImportAsync(
            int courseOfferingId, DateOnly date, Stream fileStream, string fileType)
        {
            var response = new BulkAttendanceValidationResponse();

            // Get all enrollments for this course
            var enrollments = await _courseEnrollmentRepository.GetByCourseOfferingIdAsync(courseOfferingId);
            if (enrollments == null || enrollments.Count == 0)
                throw new KeyNotFoundException("Course offering not found or has no enrollments");

            // Parse file based on type
            List<AttendanceImportRowData> records;
            List<ExcelParseError> parseErrors;

            if (fileType.Equals(".xlsx", StringComparison.OrdinalIgnoreCase) ||
                fileType.Equals(".xls", StringComparison.OrdinalIgnoreCase))
            {
                (records, parseErrors) = ExcelHelperService.ParseAttendanceImportExcel(fileStream);
            }
            else
            {
                // CSV parsing
                var csvResult = await CsvHelperService.ParseCsvWithErrorsAsync<AttendanceCsvImportRequest>(fileStream);
                records = csvResult.Records.Select((r, i) => new AttendanceImportRowData
                {
                    RowNumber = i + 2,
                    RollNumber = r.EnrollmentNumber,
                    Status = r.Status,
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
                response.Rows.Add(new AttendanceValidationRow
                {
                    RowNumber = error.RowNumber,
                    RollNumber = error.RawData ?? "",
                    IsValid = false,
                    Errors = new List<string> { error.ErrorMessage }
                });
                response.InvalidRows++;
            }

            var validStatuses = new[] { "present", "absent", "late", "excused" };

            // Validate each record
            foreach (var record in records)
            {
                var validationRow = new AttendanceValidationRow
                {
                    RowNumber = record.RowNumber,
                    RollNumber = record.RollNumber,
                    Status = record.Status,
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
                    var enrollment = enrollments.FirstOrDefault(e =>
                        e.Student.EnrollmentNumber.Equals(record.RollNumber, StringComparison.OrdinalIgnoreCase));

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

                        // Check for existing attendance
                        var existingRecord = await _attendanceRecordRepository.FindByEnrollmentAndDateAsync(
                            enrollment.Id, date);
                        if (existingRecord != null)
                        {
                            validationRow.HasConflict = true;
                            validationRow.ExistingStatus = existingRecord.Status;
                        }
                    }
                }

                // Validate status
                if (string.IsNullOrWhiteSpace(record.Status))
                {
                    validationRow.Errors.Add("Status is required");
                    validationRow.IsValid = false;
                }
                else if (!validStatuses.Contains(record.Status.ToLower()))
                {
                    validationRow.Errors.Add($"Invalid status '{record.Status}'. Valid: Present, Absent, Late, Excused");
                    validationRow.IsValid = false;
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
        /// Import attendance with conflict resolution
        /// </summary>
        public async Task<BulkOperationResponse<AttendanceRecordResponse>> ImportAttendanceWithValidationAsync(
            BulkAttendanceImportRequest request)
        {
            var response = new BulkOperationResponse<AttendanceRecordResponse>();

            // Validate course offering
            var enrollments = await _courseEnrollmentRepository.GetByCourseOfferingIdAsync(request.CourseOfferingId);
            if (enrollments == null || enrollments.Count == 0)
                throw new KeyNotFoundException("Course offering not found or has no enrollments");

            // Validate faculty
            if (!await _facultyRepository.ExistsAsync(request.MarkedById))
                throw new KeyNotFoundException("Faculty not found");

            response.TotalRecords = request.Rows.Count;

            foreach (var row in request.Rows)
            {
                try
                {
                    // Find enrollment
                    var enrollment = enrollments.FirstOrDefault(e =>
                        e.Student.EnrollmentNumber.Equals(row.RollNumber, StringComparison.OrdinalIgnoreCase));

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

                    // Check for existing attendance
                    var existingRecord = await _attendanceRecordRepository.FindByEnrollmentAndDateAsync(
                        enrollment.Id, request.AttendanceDate);

                    AttendanceRecord? finalRecord = null;

                    if (existingRecord != null)
                    {
                        // Handle conflict
                        switch (request.ConflictResolution.ToLower())
                        {
                            case "skip":
                                response.Errors.Add(new BulkOperationError
                                {
                                    RowNumber = row.RowNumber,
                                    Identifier = row.RollNumber,
                                    ErrorMessage = "Skipped - attendance already exists"
                                });
                                continue;

                            case "error":
                                response.Errors.Add(new BulkOperationError
                                {
                                    RowNumber = row.RowNumber,
                                    Identifier = row.RollNumber,
                                    ErrorMessage = "Conflict - attendance already exists"
                                });
                                continue;

                            case "update":
                                existingRecord.Status = NormalizeStatus(row.Status);
                                existingRecord.Remarks = row.Remarks;
                                existingRecord.RecordedBy = request.MarkedById;
                                existingRecord.UpdatedAt = DateTime.UtcNow;
                                await _attendanceRecordRepository.UpdateAsync(existingRecord);
                                finalRecord = await _attendanceRecordRepository.GetByIdAsync(existingRecord.Id);
                                break;
                        }
                    }
                    else
                    {
                        // Create new record
                        var newRecord = new AttendanceRecord
                        {
                            EnrollmentId = enrollment.Id,
                            AttendanceDate = request.AttendanceDate,
                            Status = NormalizeStatus(row.Status),
                            Remarks = row.Remarks,
                            RecordedBy = request.MarkedById,
                            CreatedAt = DateTime.UtcNow
                        };
                        await _attendanceRecordRepository.CreateAsync(newRecord);
                        finalRecord = await _attendanceRecordRepository.GetByIdAsync(newRecord.Id);
                    }

                    if (finalRecord != null)
                    {
                        response.SuccessfulRecords.Add(new AttendanceRecordResponse
                        {
                            Id = finalRecord.Id,
                            EnrollmentId = finalRecord.EnrollmentId,
                            StudentId = finalRecord.Enrollment.StudentId,
                            StudentName = finalRecord.Enrollment.Student.IdNavigation.FullName,
                            EnrollmentNumber = finalRecord.Enrollment.Student.EnrollmentNumber,
                            SubjectCode = finalRecord.Enrollment.CourseOffering.Subject.Code,
                            SubjectName = finalRecord.Enrollment.CourseOffering.Subject.Name,
                            AttendanceDate = finalRecord.AttendanceDate,
                            Status = finalRecord.Status,
                            RecordedBy = finalRecord.RecordedBy,
                            RecordedByName = finalRecord.RecordedByNavigation?.IdNavigation.FullName,
                            Remarks = finalRecord.Remarks,
                            CreatedAt = finalRecord.CreatedAt,
                            UpdatedAt = finalRecord.UpdatedAt
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
        /// Generate Excel template for attendance import
        /// </summary>
        public async Task<byte[]> GetAttendanceTemplateExcelAsync(int courseOfferingId)
        {
            var enrollments = await _courseEnrollmentRepository.GetByCourseOfferingIdAsync(courseOfferingId);
            if (enrollments == null || enrollments.Count == 0)
                throw new KeyNotFoundException("Course offering not found or has no enrollments");

            var courseOffering = enrollments.First().CourseOffering;

            var templateData = enrollments.Select(e => new
            {
                RollNumber = e.Student.EnrollmentNumber,
                StudentName = e.Student.IdNavigation.FullName,
                Status = "",
                Remarks = ""
            }).ToList();

            return ExcelHelperService.GenerateExcel(templateData, $"Attendance - {courseOffering.Subject.Code}");
        }

        private static string NormalizeStatus(string status)
        {
            return status.ToLower() switch
            {
                "p" or "present" or "1" or "yes" => "Present",
                "a" or "absent" or "0" or "no" => "Absent",
                "l" or "late" => "Late",
                "e" or "excused" => "Excused",
                _ => status
            };
        }

        #endregion
    }
}