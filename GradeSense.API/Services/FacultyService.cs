using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Faculty.Request;
using GradeSense.API.DTOs.Faculty.Response;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;
using GradeSense.API.Helpers;
using ClosedXML.Excel;

namespace GradeSense.API.Services
{
    public class FacultyService : IFacultyService
    {
        private readonly IFacultyRepository _facultyRepository;
        private readonly IUserRepository _userRepository;
        private readonly IDepartmentRepository _departmentRepository;

        public FacultyService(
            IFacultyRepository facultyRepository,
            IUserRepository userRepository,
            IDepartmentRepository departmentRepository)
        {
            _facultyRepository = facultyRepository;
            _userRepository = userRepository;
            _departmentRepository = departmentRepository;
        }

        public async Task<PagedResponse<FacultyListResponse>> GetAllAsync(FacultyFilterRequest filter)
        {
            var (faculties, total) = await _facultyRepository.GetAllAsync(filter);

            var data = faculties.Select(f => new FacultyListResponse
            {
                Id = f.Id,
                EmployeeId = f.EmployeeId,
                FullName = f.IdNavigation.FullName,
                PersonalEmail = f.IdNavigation.PersonalEmail,
                InstitutionalEmail = f.IdNavigation.InstitutionalEmail,
                PhoneNumber = f.IdNavigation.PhoneNumber,
                ProfileImagePath = f.IdNavigation.ProfileImagePath,
                DepartmentName = f.Department.Name,
                Designation = f.Designation,
                IsActive = f.IdNavigation.IsActive,
                CreatedAt = f.CreatedAt
            }).ToList();

            return new PagedResponse<FacultyListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<FacultyDetailResponse?> GetByIdAsync(int id)
        {
            var faculty = await _facultyRepository.GetByIdAsync(id);
            if (faculty == null) return null;

            return new FacultyDetailResponse
            {
                Id = faculty.Id,
                EmployeeId = faculty.EmployeeId,
                DepartmentId = faculty.DepartmentId,
                DepartmentName = faculty.Department.Name,
                DepartmentCode = faculty.Department.Code,
                Designation = faculty.Designation,
                JoiningDate = faculty.JoiningDate,
                Qualification = faculty.Qualification,
                Specialization = faculty.Specialization,
                CreatedAt = faculty.CreatedAt,
                UpdatedAt = faculty.UpdatedAt,
                DeletedAt = faculty.DeletedAt,
                FullName = faculty.IdNavigation.FullName,
                PersonalEmail = faculty.IdNavigation.PersonalEmail,
                InstitutionalEmail = faculty.IdNavigation.InstitutionalEmail,
                PhoneNumber = faculty.IdNavigation.PhoneNumber,
                ProfileImagePath = faculty.IdNavigation.ProfileImagePath,
                IsActive = faculty.IdNavigation.IsActive,
                AssignedCoursesCount = await _facultyRepository.GetAssignedCoursesCountAsync(id),
                CoordinatingBatchesCount = await _facultyRepository.GetCoordinatingBatchesCountAsync(id),
                CoordinatingCoursesCount = await _facultyRepository.GetCoordinatingCoursesCountAsync(id)
            };
        }

        public async Task<FacultyResponse> CreateAsync(CreateFacultyRequest request)
        {
            // Validate User exists
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            // Validate User has Faculty role
            if (user.Role != "Faculty")
                throw new InvalidOperationException("User must have Faculty role");

            // Validate User is active
            if (!user.IsActive || user.DeletedAt != null)
                throw new InvalidOperationException("User is not active");

            // Validate User is not already linked to a Faculty
            if (await _facultyRepository.UserIdExistsAsync(request.UserId))
                throw new InvalidOperationException("User is already linked to a Faculty record");

            // Validate EmployeeId is unique
            if (await _facultyRepository.EmployeeIdExistsAsync(request.EmployeeId))
                throw new InvalidOperationException("Employee ID already exists");

            // Validate Department exists
            if (!await _departmentRepository.ExistsAsync(request.DepartmentId))
                throw new KeyNotFoundException("Department not found");

            var faculty = new Faculty
            {
                Id = request.UserId, // Important: Use UserId as Id (1-to-1 relationship)
                EmployeeId = request.EmployeeId,
                DepartmentId = request.DepartmentId,
                Designation = request.Designation,
                JoiningDate = request.JoiningDate,
                Qualification = request.Qualification,
                Specialization = request.Specialization
            };

            await _facultyRepository.CreateAsync(faculty);

            // Reload with navigation properties
            faculty = await _facultyRepository.GetByIdAsync(faculty.Id);

            return new FacultyResponse
            {
                Id = faculty!.Id,
                EmployeeId = faculty.EmployeeId,
                DepartmentId = faculty.DepartmentId,
                DepartmentName = faculty.Department.Name,
                Designation = faculty.Designation,
                JoiningDate = faculty.JoiningDate,
                Qualification = faculty.Qualification,
                Specialization = faculty.Specialization,
                CreatedAt = faculty.CreatedAt,
                UpdatedAt = faculty.UpdatedAt,
                FullName = faculty.IdNavigation.FullName,
                PersonalEmail = faculty.IdNavigation.PersonalEmail,
                InstitutionalEmail = faculty.IdNavigation.InstitutionalEmail,
                PhoneNumber = faculty.IdNavigation.PhoneNumber
            };
        }

        public async Task<FacultyResponse> UpdateAsync(int id, UpdateFacultyRequest request)
        {
            var faculty = await _facultyRepository.GetByIdAsync(id);
            if (faculty == null)
                throw new KeyNotFoundException("Faculty not found");

            // Validate EmployeeId uniqueness if being changed
            if (!string.IsNullOrEmpty(request.EmployeeId) &&
                request.EmployeeId != faculty.EmployeeId &&
                await _facultyRepository.EmployeeIdExistsAsync(request.EmployeeId, id))
            {
                throw new InvalidOperationException("Employee ID already exists");
            }

            // Validate Department exists if being changed
            if (request.DepartmentId.HasValue &&
                !await _departmentRepository.ExistsAsync(request.DepartmentId.Value))
            {
                throw new KeyNotFoundException("Department not found");
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.EmployeeId))
                faculty.EmployeeId = request.EmployeeId;

            if (request.DepartmentId.HasValue)
                faculty.DepartmentId = request.DepartmentId.Value;

            faculty.Designation = request.Designation ?? faculty.Designation;
            faculty.JoiningDate = request.JoiningDate ?? faculty.JoiningDate;
            faculty.Qualification = request.Qualification ?? faculty.Qualification;
            faculty.Specialization = request.Specialization ?? faculty.Specialization;

            await _facultyRepository.UpdateAsync(faculty);

            // Reload with navigation properties
            faculty = await _facultyRepository.GetByIdAsync(id);

            return new FacultyResponse
            {
                Id = faculty!.Id,
                EmployeeId = faculty.EmployeeId,
                DepartmentId = faculty.DepartmentId,
                DepartmentName = faculty.Department.Name,
                Designation = faculty.Designation,
                JoiningDate = faculty.JoiningDate,
                Qualification = faculty.Qualification,
                Specialization = faculty.Specialization,
                CreatedAt = faculty.CreatedAt,
                UpdatedAt = faculty.UpdatedAt,
                FullName = faculty.IdNavigation.FullName,
                PersonalEmail = faculty.IdNavigation.PersonalEmail,
                InstitutionalEmail = faculty.IdNavigation.InstitutionalEmail,
                PhoneNumber = faculty.IdNavigation.PhoneNumber
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _facultyRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Faculty not found");

            // Check if faculty is coordinating any batches
            var coordinatingBatches = await _facultyRepository.GetCoordinatingBatchesCountAsync(id);
            if (coordinatingBatches > 0)
                throw new InvalidOperationException($"Cannot delete faculty who is coordinating {coordinatingBatches} batch(es)");

            // Check if faculty is coordinating any courses
            var coordinatingCourses = await _facultyRepository.GetCoordinatingCoursesCountAsync(id);
            if (coordinatingCourses > 0)
                throw new InvalidOperationException($"Cannot delete faculty who is coordinating {coordinatingCourses} course(s)");

            // Check if faculty is assigned to any courses
            var assignedCourses = await _facultyRepository.GetAssignedCoursesCountAsync(id);
            if (assignedCourses > 0)
                throw new InvalidOperationException($"Cannot delete faculty who is assigned to {assignedCourses} course(s)");

            // Check if faculty is HOD of any department
            var departments = await _departmentRepository.GetAllAsync(new DTOs.Department.Request.DepartmentFilterRequest
            {
                PageSize = int.MaxValue
            });
            var isHOD = departments.Departments.Any(d => d.HoduserId == id);
            if (isHOD)
                throw new InvalidOperationException("Cannot delete faculty who is HOD of a department");

            return await _facultyRepository.DeleteAsync(id);
        }

        #region Bulk Import Operations

        public async Task<BulkFacultyValidationResponse> ValidateFacultyImportAsync(Stream fileStream, string fileExtension)
        {
            var response = new BulkFacultyValidationResponse();

            // Parse file
            List<FacultyImportRowData> records;
            List<ExcelParseError> parseErrors;

            if (fileExtension.Equals(".xlsx", StringComparison.OrdinalIgnoreCase) ||
                fileExtension.Equals(".xls", StringComparison.OrdinalIgnoreCase))
            {
                (records, parseErrors) = ExcelHelperService.ParseFacultyImportExcel(fileStream);
            }
            else
            {
                var csvResult = await CsvHelperService.ParseCsvWithErrorsAsync<FacultyCsvImportRequest>(fileStream);
                records = csvResult.Records.Select((r, i) => new FacultyImportRowData
                {
                    RowNumber = i + 2,
                    PersonalEmail = r.PersonalEmail,
                    InstitutionalEmail = r.InstitutionalEmail,
                    PhoneNumber = r.PhoneNumber,
                    FullName = r.FullName,
                    Password = r.Password,
                    EmployeeId = r.EmployeeId,
                    DepartmentCode = r.DepartmentCode,
                    Designation = r.Designation,
                    JoiningDate = !string.IsNullOrEmpty(r.JoiningDate) && DateOnly.TryParse(r.JoiningDate, out var jd) ? jd : null,
                    Specialization = r.Specialization,
                    Status = r.Status
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
                response.Rows.Add(new FacultyValidationRow
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

            var validStatuses = new[] { "Active", "OnLeave", "Resigned", "Retired" };

            foreach (var record in records)
            {
                var validationRow = new FacultyValidationRow
                {
                    RowNumber = record.RowNumber,
                    PersonalEmail = record.PersonalEmail,
                    InstitutionalEmail = record.InstitutionalEmail,
                    PhoneNumber = record.PhoneNumber,
                    FullName = record.FullName,
                    EmployeeId = record.EmployeeId,
                    DepartmentCode = record.DepartmentCode,
                    Designation = record.Designation,
                    JoiningDate = record.JoiningDate,
                    Specialization = record.Specialization,
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
                        validationRow.ExistingFacultyId = existingUser.Id;
                        validationRow.ExistingFacultyName = existingUser.FullName;
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

                // Validate employee ID
                if (string.IsNullOrWhiteSpace(record.EmployeeId))
                {
                    validationRow.Errors.Add("Employee ID is required");
                    validationRow.IsValid = false;
                }
                else
                {
                    var existingFaculty = await _facultyRepository.GetByEmployeeIdAsync(record.EmployeeId);
                    if (existingFaculty != null && !validationRow.HasConflict)
                    {
                        validationRow.HasConflict = true;
                        validationRow.ExistingFacultyId = existingFaculty.Id;
                        validationRow.ExistingFacultyName = existingFaculty.IdNavigation.FullName;
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

                // Validate status
                if (!validStatuses.Contains(record.Status, StringComparer.OrdinalIgnoreCase))
                {
                    validationRow.Errors.Add($"Invalid status '{record.Status}'. Valid: Active, OnLeave, Resigned, Retired");
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

        public async Task<BulkOperationResponse<FacultyResponse>> ImportFacultiesWithValidationAsync(BulkFacultyImportRequest request)
        {
            var response = new BulkOperationResponse<FacultyResponse>();
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
                    var existingFaculty = !string.IsNullOrEmpty(row.EmployeeId) 
                        ? await _facultyRepository.GetByEmployeeIdAsync(row.EmployeeId) 
                        : null;

                    if (existingUser != null || existingFaculty != null)
                    {
                        switch (request.ConflictResolution.ToLower())
                        {
                            case "skip":
                                response.ErrorCount++;
                                response.Errors.Add(new BulkOperationError
                                {
                                    RowNumber = row.RowNumber,
                                    Identifier = row.PersonalEmail,
                                    ErrorMessage = "Faculty already exists (skipped)"
                                });
                                continue;

                            case "update":
                                if (existingFaculty != null)
                                {
                                    existingFaculty.IdNavigation.FullName = row.FullName;
                                    existingFaculty.IdNavigation.InstitutionalEmail = string.IsNullOrWhiteSpace(row.InstitutionalEmail) ? null : row.InstitutionalEmail;
                                    existingFaculty.IdNavigation.PhoneNumber = string.IsNullOrWhiteSpace(row.PhoneNumber) ? null : row.PhoneNumber;
                                    existingFaculty.IdNavigation.UpdatedAt = DateTime.UtcNow;
                                    
                                    if (deptLookup.TryGetValue(row.DepartmentCode.ToLower(), out var deptId))
                                        existingFaculty.DepartmentId = deptId;
                                    
                                    existingFaculty.Designation = row.Designation;
                                    existingFaculty.JoiningDate = row.JoiningDate;
                                    existingFaculty.Specialization = row.Specialization;
                                    existingFaculty.UpdatedAt = DateTime.UtcNow;

                                    await _userRepository.UpdateAsync(existingFaculty.IdNavigation);
                                    await _facultyRepository.UpdateAsync(existingFaculty);

                                    response.SuccessCount++;
                                    response.SuccessfulRecords.Add(MapToResponse(existingFaculty));
                                    continue;
                                }
                                break;

                            default:
                                response.ErrorCount++;
                                response.Errors.Add(new BulkOperationError
                                {
                                    RowNumber = row.RowNumber,
                                    Identifier = row.PersonalEmail,
                                    ErrorMessage = "Faculty already exists"
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

                    // Create new user and faculty
                    var user = new User
                    {
                        PersonalEmail = row.PersonalEmail,
                        InstitutionalEmail = string.IsNullOrWhiteSpace(row.InstitutionalEmail) ? null : row.InstitutionalEmail,
                        PhoneNumber = string.IsNullOrWhiteSpace(row.PhoneNumber) ? null : row.PhoneNumber,
                        FullName = row.FullName,
                        PasswordHash = PasswordHasher.HashPassword(row.Password),
                        Role = "Faculty",
                        IsActive = row.Status == "Active",
                        CreatedAt = DateTime.UtcNow
                    };

                    var createdUser = await _userRepository.CreateAsync(user);

                    var faculty = new Faculty
                    {
                        Id = createdUser.Id,
                        EmployeeId = row.EmployeeId,
                        DepartmentId = departmentId,
                        Designation = row.Designation,
                        JoiningDate = row.JoiningDate,
                        Specialization = row.Specialization,
                        CreatedAt = DateTime.UtcNow
                    };

                    var createdFaculty = await _facultyRepository.CreateAsync(faculty);
                    createdFaculty = await _facultyRepository.GetByIdAsync(createdFaculty.Id);
                    
                    response.SuccessCount++;
                    response.SuccessfulRecords.Add(MapToResponse(createdFaculty!));
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

        public Task<byte[]> GetFacultyImportTemplateAsync()
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Faculty");

            var headers = new[] { "Personal Email", "Institutional Email", "Phone Number", "Full Name", "Password", 
                                  "Employee ID", "Department Code", "Designation", "Joining Date", "Specialization", "Status" };
            for (int i = 0; i < headers.Length; i++)
            {
                var cell = worksheet.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            }

            // Sample data
            worksheet.Cell(2, 1).Value = "faculty@example.com";
            worksheet.Cell(2, 2).Value = "faculty@university.edu";
            worksheet.Cell(2, 3).Value = "+1234567890";
            worksheet.Cell(2, 4).Value = "Dr. Jane Smith";
            worksheet.Cell(2, 5).Value = "Password123";
            worksheet.Cell(2, 6).Value = "EMP001";
            worksheet.Cell(2, 7).Value = "CS";
            worksheet.Cell(2, 8).Value = "Professor";
            worksheet.Cell(2, 9).Value = DateTime.Now.ToString("yyyy-MM-dd");
            worksheet.Cell(2, 10).Value = "Machine Learning";
            worksheet.Cell(2, 11).Value = "Active";

            // Add validation dropdown for Status
            var statusRange = worksheet.Range(2, 11, 1000, 11);
            statusRange.SetDataValidation().List("Active,OnLeave,Resigned,Retired");

            worksheet.Columns().AdjustToContents();
            worksheet.SheetView.FreezeRows(1);

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return Task.FromResult(stream.ToArray());
        }

        private static FacultyResponse MapToResponse(Faculty faculty)
        {
            return new FacultyResponse
            {
                Id = faculty.Id,
                EmployeeId = faculty.EmployeeId,
                DepartmentId = faculty.DepartmentId,
                DepartmentName = faculty.Department?.Name ?? "",
                Designation = faculty.Designation,
                JoiningDate = faculty.JoiningDate,
                Qualification = faculty.Qualification,
                Specialization = faculty.Specialization,
                CreatedAt = faculty.CreatedAt,
                UpdatedAt = faculty.UpdatedAt,
                FullName = faculty.IdNavigation?.FullName ?? "",
                PersonalEmail = faculty.IdNavigation?.PersonalEmail ?? "",
                InstitutionalEmail = faculty.IdNavigation?.InstitutionalEmail,
                PhoneNumber = faculty.IdNavigation?.PhoneNumber
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