using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Student.Request;
using GradeSense.API.DTOs.Student.Response;
using GradeSense.API.Helpers;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;
using ClosedXML.Excel;

namespace GradeSense.API.Services
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IDepartmentRepository _departmentRepository;

        public StudentService(
            IStudentRepository studentRepository,
            IUserRepository userRepository,
            IDepartmentRepository departmentRepository)
        {
            _studentRepository = studentRepository;
            _userRepository = userRepository;
            _departmentRepository = departmentRepository;
        }

        public async Task<PagedResponse<StudentListResponse>> GetAllAsync(StudentFilterRequest filter)
        {
            var (students, total) = await _studentRepository.GetAllAsync(filter);

            var data = students.Select(s => new StudentListResponse
            {
                Id = s.Id,
                EnrollmentNumber = s.EnrollmentNumber,
                FullName = s.IdNavigation.FullName,
                PersonalEmail = s.IdNavigation.PersonalEmail,
                InstitutionalEmail = s.IdNavigation.InstitutionalEmail,
                PhoneNumber = s.IdNavigation.PhoneNumber,
                ProfileImagePath = s.IdNavigation.ProfileImagePath,
                DepartmentName = s.Department.Name,
                CurrentSemester = s.CurrentSemester,
                Status = s.Status,
                IsActive = s.IdNavigation.IsActive,
                CGPA = s.Cgpa,
                CreatedAt = s.CreatedAt
            }).ToList();

            return new PagedResponse<StudentListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<StudentDetailResponse?> GetByIdAsync(int id)
        {
            var student = await _studentRepository.GetByIdAsync(id);
            if (student == null) return null;

            return new StudentDetailResponse
            {
                Id = student.Id,
                EnrollmentNumber = student.EnrollmentNumber,
                AdmissionYear = student.AdmissionYear,
                CurrentSemester = student.CurrentSemester,
                DepartmentId = student.DepartmentId,
                DepartmentName = student.Department.Name,
                DepartmentCode = student.Department.Code,
                Status = student.Status,
                CGPA = student.Cgpa,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt,
                DeletedAt = student.DeletedAt,
                FullName = student.IdNavigation.FullName,
                PersonalEmail = student.IdNavigation.PersonalEmail,
                InstitutionalEmail = student.IdNavigation.InstitutionalEmail,
                PhoneNumber = student.IdNavigation.PhoneNumber,
                ProfileImagePath = student.IdNavigation.ProfileImagePath,
                IsActive = student.IdNavigation.IsActive,
                EnrolledCoursesCount = await _studentRepository.GetEnrolledCoursesCountAsync(id),
                CompletedCoursesCount = await _studentRepository.GetCompletedCoursesCountAsync(id),
                ActiveCoursesCount = await _studentRepository.GetActiveCoursesCountAsync(id)
            };
        }

        public async Task<StudentResponse> CreateAsync(CreateStudentRequest request)
        {
            // Validate User exists
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            // Validate User has Student role
            if (user.Role != "Student")
                throw new InvalidOperationException("User must have Student role");

            // Validate User is active
            if (!user.IsActive || user.DeletedAt != null)
                throw new InvalidOperationException("User is not active");

            // Validate User is not already linked to a Student
            if (await _studentRepository.UserIdExistsAsync(request.UserId))
                throw new InvalidOperationException("User is already linked to a Student record");

            // Validate EnrollmentNumber is unique
            if (await _studentRepository.EnrollmentNumberExistsAsync(request.EnrollmentNumber))
                throw new InvalidOperationException("Enrollment number already exists");

            // Validate Department exists
            if (!await _departmentRepository.ExistsAsync(request.DepartmentId))
                throw new KeyNotFoundException("Department not found");

            var student = new Student
            {
                Id = request.UserId, // Important: Use UserId as Id (1-to-1 relationship)
                EnrollmentNumber = request.EnrollmentNumber,
                AdmissionYear = request.AdmissionYear,
                CurrentSemester = request.CurrentSemester,
                DepartmentId = request.DepartmentId,
                Status = request.Status,
                Cgpa = request.CGPA
            };

            await _studentRepository.CreateAsync(student);

            // Reload with navigation properties
            student = await _studentRepository.GetByIdAsync(student.Id);

            return new StudentResponse
            {
                Id = student!.Id,
                EnrollmentNumber = student.EnrollmentNumber,
                AdmissionYear = student.AdmissionYear,
                CurrentSemester = student.CurrentSemester,
                DepartmentId = student.DepartmentId,
                DepartmentName = student.Department.Name,
                Status = student.Status,
                CGPA = student.Cgpa,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt,
                FullName = student.IdNavigation.FullName,
                PersonalEmail = student.IdNavigation.PersonalEmail,
                InstitutionalEmail = student.IdNavigation.InstitutionalEmail,
                PhoneNumber = student.IdNavigation.PhoneNumber
            };
        }

        public async Task<StudentResponse> UpdateAsync(int id, UpdateStudentRequest request)
        {
            var student = await _studentRepository.GetByIdAsync(id);
            if (student == null)
                throw new KeyNotFoundException("Student not found");

            // Validate EnrollmentNumber uniqueness if being changed
            if (!string.IsNullOrEmpty(request.EnrollmentNumber) &&
                request.EnrollmentNumber != student.EnrollmentNumber &&
                await _studentRepository.EnrollmentNumberExistsAsync(request.EnrollmentNumber, id))
            {
                throw new InvalidOperationException("Enrollment number already exists");
            }

            // Validate Department exists if being changed
            if (request.DepartmentId.HasValue &&
                !await _departmentRepository.ExistsAsync(request.DepartmentId.Value))
            {
                throw new KeyNotFoundException("Department not found");
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.EnrollmentNumber))
                student.EnrollmentNumber = request.EnrollmentNumber;

            if (request.AdmissionYear.HasValue)
                student.AdmissionYear = request.AdmissionYear.Value;

            if (request.CurrentSemester.HasValue)
                student.CurrentSemester = request.CurrentSemester.Value;

            if (request.DepartmentId.HasValue)
                student.DepartmentId = request.DepartmentId.Value;

            if (!string.IsNullOrEmpty(request.Status))
                student.Status = request.Status;

            if (request.CGPA.HasValue)
                student.Cgpa = request.CGPA.Value;

            await _studentRepository.UpdateAsync(student);

            // Reload with navigation properties
            student = await _studentRepository.GetByIdAsync(id);

            return new StudentResponse
            {
                Id = student!.Id,
                EnrollmentNumber = student.EnrollmentNumber,
                AdmissionYear = student.AdmissionYear,
                CurrentSemester = student.CurrentSemester,
                DepartmentId = student.DepartmentId,
                DepartmentName = student.Department.Name,
                Status = student.Status,
                CGPA = student.Cgpa,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt,
                FullName = student.IdNavigation.FullName,
                PersonalEmail = student.IdNavigation.PersonalEmail,
                InstitutionalEmail = student.IdNavigation.InstitutionalEmail,
                PhoneNumber = student.IdNavigation.PhoneNumber
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _studentRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Student not found");

            // Check if student has any course enrollments
            var enrolledCourses = await _studentRepository.GetEnrolledCoursesCountAsync(id);
            if (enrolledCourses > 0)
                throw new InvalidOperationException($"Cannot delete student who has {enrolledCourses} course enrollment(s)");

            return await _studentRepository.DeleteAsync(id);
        }

        #region Bulk Operations

        public async Task<BulkOperationResponse<StudentResponse>> BulkImportFromCsvAsync(Stream csvStream)
        {
            var response = new BulkOperationResponse<StudentResponse>();
            var (records, parseErrors) = await CsvHelperService.ParseCsvWithErrorsAsync<StudentCsvImportRequest>(csvStream);

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

            // Get all departments for lookup
            var departments = await _departmentRepository.GetAllForLookupAsync();
            var departmentLookup = departments.ToDictionary(d => d.Code.ToUpper(), d => d.Id);

            int rowNumber = 1; // Start after header
            foreach (var record in records)
            {
                rowNumber++;
                var errors = new Dictionary<string, string>();

                try
                {
                    // Validate required fields
                    if (string.IsNullOrWhiteSpace(record.PersonalEmail))
                        errors["PersonalEmail"] = "Personal email is required";

                    if (string.IsNullOrWhiteSpace(record.FullName))
                        errors["FullName"] = "Full name is required";

                    if (string.IsNullOrWhiteSpace(record.Password))
                        errors["Password"] = "Password is required";

                    if (string.IsNullOrWhiteSpace(record.EnrollmentNumber))
                        errors["EnrollmentNumber"] = "Enrollment number is required";

                    if (string.IsNullOrWhiteSpace(record.DepartmentCode))
                        errors["DepartmentCode"] = "Department code is required";

                    // Check if personal email already exists
                    if (!string.IsNullOrWhiteSpace(record.PersonalEmail) && await _userRepository.PersonalEmailExistsAsync(record.PersonalEmail))
                        errors["PersonalEmail"] = $"Personal email '{record.PersonalEmail}' already exists";

                    // Check if institutional email already exists (if provided)
                    if (!string.IsNullOrWhiteSpace(record.InstitutionalEmail) && await _userRepository.InstitutionalEmailExistsAsync(record.InstitutionalEmail))
                        errors["InstitutionalEmail"] = $"Institutional email '{record.InstitutionalEmail}' already exists";

                    // Check if phone number already exists (if provided)
                    if (!string.IsNullOrWhiteSpace(record.PhoneNumber) && await _userRepository.PhoneNumberExistsAsync(record.PhoneNumber))
                        errors["PhoneNumber"] = $"Phone number '{record.PhoneNumber}' already exists";

                    // Check if enrollment number already exists
                    if (!string.IsNullOrWhiteSpace(record.EnrollmentNumber) && 
                        await _studentRepository.EnrollmentNumberExistsAsync(record.EnrollmentNumber))
                        errors["EnrollmentNumber"] = $"Enrollment number '{record.EnrollmentNumber}' already exists";

                    // Validate department
                    if (!string.IsNullOrWhiteSpace(record.DepartmentCode) && 
                        !departmentLookup.ContainsKey(record.DepartmentCode.ToUpper()))
                        errors["DepartmentCode"] = $"Department code '{record.DepartmentCode}' not found";

                    // Validate admission year
                    if (record.AdmissionYear < 2000 || record.AdmissionYear > DateTime.Now.Year + 1)
                        errors["AdmissionYear"] = "Admission year must be between 2000 and next year";

                    // Validate semester
                    if (record.CurrentSemester < 1 || record.CurrentSemester > 8)
                        errors["CurrentSemester"] = "Semester must be between 1 and 8";

                    // Validate CGPA
                    if (record.CGPA.HasValue && (record.CGPA < 0 || record.CGPA > 10))
                        errors["CGPA"] = "CGPA must be between 0 and 10";

                    // Validate status
                    var validStatuses = new[] { "Active", "Suspended", "Graduated", "Dropped" };
                    if (!validStatuses.Contains(record.Status))
                        errors["Status"] = "Status must be Active, Suspended, Graduated, or Dropped";

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

                    // Create User first
                    var user = new User
                    {
                        PersonalEmail = record.PersonalEmail,
                        InstitutionalEmail = record.InstitutionalEmail,
                        PhoneNumber = record.PhoneNumber,
                        FullName = record.FullName,
                        PasswordHash = PasswordHasher.HashPassword(record.Password),
                        Role = "Student",
                        IsActive = true
                    };

                    await _userRepository.CreateAsync(user);

                    // Create Student linked to User
                    var student = new Student
                    {
                        Id = user.Id,
                        EnrollmentNumber = record.EnrollmentNumber,
                        AdmissionYear = record.AdmissionYear,
                        CurrentSemester = record.CurrentSemester,
                        DepartmentId = departmentLookup[record.DepartmentCode.ToUpper()],
                        Status = record.Status,
                        Cgpa = record.CGPA
                    };

                    await _studentRepository.CreateAsync(student);

                    // Reload with navigation properties
                    student = await _studentRepository.GetByIdAsync(student.Id);

                    response.SuccessfulRecords.Add(new StudentResponse
                    {
                        Id = student!.Id,
                        EnrollmentNumber = student.EnrollmentNumber,
                        AdmissionYear = student.AdmissionYear,
                        CurrentSemester = student.CurrentSemester,
                        DepartmentId = student.DepartmentId,
                        DepartmentName = student.Department.Name,
                        Status = student.Status,
                        CGPA = student.Cgpa,
                        CreatedAt = student.CreatedAt,
                        FullName = student.IdNavigation.FullName,
                        PersonalEmail = student.IdNavigation.PersonalEmail,
                        InstitutionalEmail = student.IdNavigation.InstitutionalEmail,
                        PhoneNumber = student.IdNavigation.PhoneNumber
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

        public async Task<byte[]> ExportToCsvAsync(StudentExportFilterRequest filter)
        {
            // Build filter request
            var filterRequest = new StudentFilterRequest
            {
                DepartmentId = filter.DepartmentId,
                Status = filter.Status,
                AdmissionYear = filter.AdmissionYear,
                CurrentSemester = filter.CurrentSemester,
                PageSize = int.MaxValue // Get all records
            };

            var (students, _) = await _studentRepository.GetAllAsync(filterRequest);

            var exportData = students.Select(s => new StudentCsvExportResponse
            {
                Id = s.Id,
                PersonalEmail = s.IdNavigation.PersonalEmail,
                InstitutionalEmail = s.IdNavigation.InstitutionalEmail,
                PhoneNumber = s.IdNavigation.PhoneNumber,
                FullName = s.IdNavigation.FullName,
                EnrollmentNumber = s.EnrollmentNumber,
                AdmissionYear = s.AdmissionYear,
                CurrentSemester = s.CurrentSemester,
                DepartmentCode = s.Department.Code,
                DepartmentName = s.Department.Name,
                Status = s.Status,
                CGPA = s.Cgpa,
                IsActive = s.IdNavigation.IsActive,
                CreatedAt = s.CreatedAt
            }).ToList();

            return await CsvHelperService.GenerateCsvAsync(exportData);
        }

        public async Task<byte[]> GetImportTemplateAsync()
        {
            // Create sample data for template
            var sampleData = new List<StudentCsvImportRequest>
            {
                new()
                {
                    PersonalEmail = "student@example.com",
                    InstitutionalEmail = "student@college.edu",
                    PhoneNumber = "+1234567890",
                    FullName = "John Doe",
                    Password = "SecurePassword123",
                    EnrollmentNumber = "2024-CS-001",
                    AdmissionYear = 2024,
                    CurrentSemester = 1,
                    DepartmentCode = "CS",
                    Status = "Active",
                    CGPA = null
                }
            };

            return await CsvHelperService.GenerateCsvAsync(sampleData);
        }

        #endregion

        #region Bulk Import with Validation

        public async Task<BulkStudentValidationResponse> ValidateStudentImportAsync(Stream fileStream, string fileExtension)
        {
            var response = new BulkStudentValidationResponse();

            // Parse file
            List<StudentImportRowData> records;
            List<ExcelParseError> parseErrors;

            if (fileExtension.Equals(".xlsx", StringComparison.OrdinalIgnoreCase) ||
                fileExtension.Equals(".xls", StringComparison.OrdinalIgnoreCase))
            {
                (records, parseErrors) = ExcelHelperService.ParseStudentImportExcel(fileStream);
            }
            else
            {
                var csvResult = await CsvHelperService.ParseCsvWithErrorsAsync<StudentCsvImportRequest>(fileStream);
                records = csvResult.Records.Select((r, i) => new StudentImportRowData
                {
                    RowNumber = i + 2,
                    PersonalEmail = r.PersonalEmail,
                    InstitutionalEmail = r.InstitutionalEmail,
                    PhoneNumber = r.PhoneNumber,
                    FullName = r.FullName,
                    Password = r.Password,
                    EnrollmentNumber = r.EnrollmentNumber,
                    AdmissionYear = r.AdmissionYear,
                    CurrentSemester = r.CurrentSemester,
                    DepartmentCode = r.DepartmentCode,
                    BatchName = null,
                    Status = r.Status ?? "Active"
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
                response.Rows.Add(new StudentValidationRow
                {
                    RowNumber = error.RowNumber,
                    PersonalEmail = error.RawData ?? "",
                    IsValid = false,
                    Errors = new List<string> { error.ErrorMessage }
                });
                response.InvalidRows++;
            }

            // Get all departments for validation
            var allDepts = await _departmentRepository.GetAllAsync(new DTOs.Department.Request.DepartmentFilterRequest { PageSize = int.MaxValue });
            var deptLookup = allDepts.Departments.ToDictionary(d => d.Code.ToLower(), d => (d.Id, d.Name));

            var validStatuses = new[] { "Active", "Graduated", "Withdrawn", "Suspended" };

            foreach (var record in records)
            {
                var validationRow = new StudentValidationRow
                {
                    RowNumber = record.RowNumber,
                    PersonalEmail = record.PersonalEmail,
                    InstitutionalEmail = record.InstitutionalEmail,
                    PhoneNumber = record.PhoneNumber,
                    FullName = record.FullName,
                    EnrollmentNumber = record.EnrollmentNumber,
                    AdmissionYear = record.AdmissionYear,
                    CurrentSemester = record.CurrentSemester,
                    DepartmentCode = record.DepartmentCode,
                    BatchName = record.BatchName,
                    Status = record.Status,
                    IsValid = true
                };

                // Validate email
                if (string.IsNullOrWhiteSpace(record.PersonalEmail))
                {
                    validationRow.Errors.Add("Personal email is required");
                    validationRow.IsValid = false;
                }
                else if (!IsValidEmail(record.PersonalEmail))
                {
                    validationRow.Errors.Add("Invalid email format");
                    validationRow.IsValid = false;
                }
                else
                {
                    var existingUser = await _userRepository.GetByEmailAsync(record.PersonalEmail);
                    if (existingUser != null)
                    {
                        validationRow.HasConflict = true;
                        validationRow.ExistingStudentId = existingUser.Id;
                        validationRow.ExistingStudentName = existingUser.FullName;
                    }
                }

                // Validate name
                if (string.IsNullOrWhiteSpace(record.FullName))
                {
                    validationRow.Errors.Add("Full name is required");
                    validationRow.IsValid = false;
                }

                // Validate password
                if (string.IsNullOrWhiteSpace(record.Password))
                {
                    validationRow.Errors.Add("Password is required");
                    validationRow.IsValid = false;
                }
                else if (record.Password.Length < 6)
                {
                    validationRow.Errors.Add("Password must be at least 6 characters");
                    validationRow.IsValid = false;
                }

                // Validate enrollment number
                if (string.IsNullOrWhiteSpace(record.EnrollmentNumber))
                {
                    validationRow.Errors.Add("Enrollment number is required");
                    validationRow.IsValid = false;
                }
                else
                {
                    var existingStudent = await _studentRepository.GetByEnrollmentNumberAsync(record.EnrollmentNumber);
                    if (existingStudent != null && !validationRow.HasConflict)
                    {
                        validationRow.HasConflict = true;
                        validationRow.ExistingStudentId = existingStudent.Id;
                        validationRow.ExistingStudentName = existingStudent.IdNavigation.FullName;
                    }
                }

                // Validate department
                if (string.IsNullOrWhiteSpace(record.DepartmentCode))
                {
                    validationRow.Errors.Add("Department code is required");
                    validationRow.IsValid = false;
                }
                else if (!deptLookup.TryGetValue(record.DepartmentCode.ToLower(), out var dept))
                {
                    validationRow.Errors.Add($"Department '{record.DepartmentCode}' not found");
                    validationRow.IsValid = false;
                }
                else
                {
                    validationRow.DepartmentId = dept.Id;
                    validationRow.DepartmentName = dept.Name;
                }

                // Validate semester
                if (record.CurrentSemester < 1 || record.CurrentSemester > 10)
                {
                    validationRow.Errors.Add("Current semester must be between 1 and 10");
                    validationRow.IsValid = false;
                }

                // Validate admission year
                var currentYear = DateTime.Now.Year;
                if (record.AdmissionYear < 2000 || record.AdmissionYear > currentYear + 1)
                {
                    validationRow.Errors.Add($"Admission year must be between 2000 and {currentYear + 1}");
                    validationRow.IsValid = false;
                }

                // Validate status
                if (!validStatuses.Contains(record.Status, StringComparer.OrdinalIgnoreCase))
                {
                    validationRow.Errors.Add($"Invalid status '{record.Status}'. Valid: Active, Graduated, Withdrawn, Suspended");
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

        public async Task<BulkOperationResponse<StudentResponse>> ImportStudentsWithValidationAsync(BulkStudentImportRequest request)
        {
            var response = new BulkOperationResponse<StudentResponse>();
            response.TotalRecords = request.Rows.Count;

            // Get department lookup
            var allDepts = await _departmentRepository.GetAllAsync(new DTOs.Department.Request.DepartmentFilterRequest { PageSize = int.MaxValue });
            var deptLookup = allDepts.Departments.ToDictionary(d => d.Code.ToLower(), d => d.Id);

            foreach (var row in request.Rows)
            {
                try
                {
                    // Check for existing user
                    var existingUser = await _userRepository.GetByEmailAsync(row.PersonalEmail);
                    var existingStudent = !string.IsNullOrEmpty(row.EnrollmentNumber) 
                        ? await _studentRepository.GetByEnrollmentNumberAsync(row.EnrollmentNumber) 
                        : null;

                    if (existingUser != null || existingStudent != null)
                    {
                        switch (request.ConflictResolution.ToLower())
                        {
                            case "skip":
                                response.ErrorCount++;
                                response.Errors.Add(new BulkOperationError
                                {
                                    RowNumber = row.RowNumber,
                                    Identifier = row.PersonalEmail,
                                    ErrorMessage = "Student already exists (skipped)"
                                });
                                continue;

                            case "update":
                                if (existingStudent != null)
                                {
                                    existingStudent.IdNavigation.FullName = row.FullName;
                                    existingStudent.IdNavigation.InstitutionalEmail = string.IsNullOrWhiteSpace(row.InstitutionalEmail) ? null : row.InstitutionalEmail;
                                    existingStudent.IdNavigation.PhoneNumber = string.IsNullOrWhiteSpace(row.PhoneNumber) ? null : row.PhoneNumber;
                                    existingStudent.IdNavigation.UpdatedAt = DateTime.UtcNow;
                                    
                                    if (deptLookup.TryGetValue(row.DepartmentCode.ToLower(), out var deptId))
                                        existingStudent.DepartmentId = deptId;
                                    
                                    existingStudent.AdmissionYear = row.AdmissionYear;
                                    existingStudent.CurrentSemester = row.CurrentSemester;
                                    existingStudent.Status = row.Status;
                                    existingStudent.UpdatedAt = DateTime.UtcNow;

                                    await _userRepository.UpdateAsync(existingStudent.IdNavigation);
                                    await _studentRepository.UpdateAsync(existingStudent);

                                    response.SuccessCount++;
                                    response.SuccessfulRecords.Add(MapToResponse(existingStudent));
                                    continue;
                                }
                                break;

                            default:
                                response.ErrorCount++;
                                response.Errors.Add(new BulkOperationError
                                {
                                    RowNumber = row.RowNumber,
                                    Identifier = row.PersonalEmail,
                                    ErrorMessage = "Student already exists"
                                });
                                continue;
                        }
                    }

                    // Get department ID
                    if (!deptLookup.TryGetValue(row.DepartmentCode.ToLower(), out var departmentId))
                    {
                        response.ErrorCount++;
                        response.Errors.Add(new BulkOperationError
                        {
                            RowNumber = row.RowNumber,
                            Identifier = row.PersonalEmail,
                            ErrorMessage = $"Department '{row.DepartmentCode}' not found"
                        });
                        continue;
                    }

                    // Create new user and student
                    var user = new User
                    {
                        PersonalEmail = row.PersonalEmail,
                        InstitutionalEmail = string.IsNullOrWhiteSpace(row.InstitutionalEmail) ? null : row.InstitutionalEmail,
                        PhoneNumber = string.IsNullOrWhiteSpace(row.PhoneNumber) ? null : row.PhoneNumber,
                        FullName = row.FullName,
                        PasswordHash = PasswordHasher.HashPassword(row.Password),
                        Role = "Student",
                        IsActive = row.Status == "Active",
                        CreatedAt = DateTime.UtcNow
                    };

                    var createdUser = await _userRepository.CreateAsync(user);

                    var student = new Student
                    {
                        Id = createdUser.Id,
                        EnrollmentNumber = row.EnrollmentNumber,
                        AdmissionYear = row.AdmissionYear,
                        CurrentSemester = row.CurrentSemester,
                        DepartmentId = departmentId,
                        Status = row.Status,
                        CreatedAt = DateTime.UtcNow
                    };

                    var createdStudent = await _studentRepository.CreateAsync(student);
                    createdStudent = await _studentRepository.GetByIdAsync(createdStudent.Id);
                    
                    response.SuccessCount++;
                    response.SuccessfulRecords.Add(MapToResponse(createdStudent!));
                }
                catch (Exception ex)
                {
                    response.ErrorCount++;
                    response.Errors.Add(new BulkOperationError
                    {
                        RowNumber = row.RowNumber,
                        Identifier = row.PersonalEmail,
                        ErrorMessage = ex.Message
                    });
                }
            }

            return response;
        }

        public Task<byte[]> GetStudentImportTemplateAsync()
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Students");

            var headers = new[] { "Personal Email", "Institutional Email", "Phone Number", "Full Name", "Password", 
                                  "Enrollment Number", "Admission Year", "Current Semester", "Department Code", "Batch", "Status" };
            for (int i = 0; i < headers.Length; i++)
            {
                var cell = worksheet.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            }

            // Sample data
            worksheet.Cell(2, 1).Value = "student@example.com";
            worksheet.Cell(2, 2).Value = "student@university.edu";
            worksheet.Cell(2, 3).Value = "+1234567890";
            worksheet.Cell(2, 4).Value = "John Doe";
            worksheet.Cell(2, 5).Value = "Password123";
            worksheet.Cell(2, 6).Value = "2024-CS-001";
            worksheet.Cell(2, 7).Value = DateTime.Now.Year;
            worksheet.Cell(2, 8).Value = 1;
            worksheet.Cell(2, 9).Value = "CS";
            worksheet.Cell(2, 10).Value = "2024-25";
            worksheet.Cell(2, 11).Value = "Active";

            // Add validation dropdown for Status
            var statusRange = worksheet.Range(2, 11, 1000, 11);
            statusRange.SetDataValidation().List("Active,Graduated,Withdrawn,Suspended");

            worksheet.Columns().AdjustToContents();
            worksheet.SheetView.FreezeRows(1);

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return Task.FromResult(stream.ToArray());
        }

        private static StudentResponse MapToResponse(Student student)
        {
            return new StudentResponse
            {
                Id = student.Id,
                EnrollmentNumber = student.EnrollmentNumber,
                AdmissionYear = student.AdmissionYear,
                CurrentSemester = student.CurrentSemester,
                DepartmentId = student.DepartmentId,
                DepartmentName = student.Department?.Name ?? "",
                Status = student.Status,
                CGPA = student.Cgpa,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt,
                FullName = student.IdNavigation?.FullName ?? "",
                PersonalEmail = student.IdNavigation?.PersonalEmail ?? "",
                InstitutionalEmail = student.IdNavigation?.InstitutionalEmail,
                PhoneNumber = student.IdNavigation?.PhoneNumber
            };
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        #endregion
    }
}