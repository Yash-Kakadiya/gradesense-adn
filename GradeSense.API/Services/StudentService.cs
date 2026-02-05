using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Student.Request;
using GradeSense.API.DTOs.Student.Response;
using GradeSense.API.Helpers;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

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
    }
}