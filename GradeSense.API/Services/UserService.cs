using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.User.Request;
using GradeSense.API.DTOs.User.Response;
using GradeSense.API.Helpers;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;
using Microsoft.AspNetCore.Identity;
using ClosedXML.Excel;

namespace GradeSense.API.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserDetailResponse?> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return null;

        var response = new UserDetailResponse
        {
            Id = user.Id,
            PersonalEmail = user.PersonalEmail,
            InstitutionalEmail = user.InstitutionalEmail,
            PhoneNumber = user.PhoneNumber,
            ProfileImagePath = user.ProfileImagePath,
            FullName = user.FullName,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            DeletedAt = user.DeletedAt
        };

        // Add role-specific information
        if (user.Role == "Faculty" && user.Faculty != null)
        {
            response.FacultyInfo = new FacultyInfoResponse
            {
                EmployeeId = user.Faculty.EmployeeId,
                DepartmentName = user.Faculty.Department?.Name ?? "N/A",
                Designation = user.Faculty.Designation,
                JoiningDate = user.Faculty.JoiningDate.HasValue ? user.Faculty.JoiningDate.Value.ToDateTime(TimeOnly.MinValue) : (DateTime?)null,
                Qualification = user.Faculty.Qualification,
                Specialization = user.Faculty.Specialization
            };
        }
        else if (user.Role == "Student" && user.Student != null)
        {
            response.StudentInfo = new StudentInfoResponse
            {
                EnrollmentNumber = user.Student.EnrollmentNumber,
                AdmissionYear = user.Student.AdmissionYear,
                CurrentSemester = user.Student.CurrentSemester,
                DepartmentName = user.Student.Department?.Name ?? "N/A",
                Status = user.Student.Status,
                CGPA = user.Student.Cgpa
            };
        }

        return response;
    }

    public async Task<PagedResponse<UserListResponse>> GetAllAsync(UserFilterRequest filter)
    {
        var (users, totalCount) = await _userRepository.GetAllAsync(filter);

        var userResponses = users.Select(u => new UserListResponse
        {
            Id = u.Id,
            PersonalEmail = u.PersonalEmail,
            InstitutionalEmail = u.InstitutionalEmail,
            PhoneNumber = u.PhoneNumber,
            ProfileImagePath = u.ProfileImagePath,
            FullName = u.FullName,
            Role = u.Role,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        }).ToList();

        return new PagedResponse<UserListResponse>(
            userResponses,
            filter.PageNumber,
            filter.PageSize,
            totalCount
        );
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request)
    {
        // Validate personal email uniqueness
        if (await _userRepository.PersonalEmailExistsAsync(request.PersonalEmail))
        {
            throw new InvalidOperationException("Personal email already exists");
        }

        // Validate institutional email uniqueness if provided
        if (!string.IsNullOrWhiteSpace(request.InstitutionalEmail) && 
            await _userRepository.InstitutionalEmailExistsAsync(request.InstitutionalEmail))
        {
            throw new InvalidOperationException("Institutional email already exists");
        }

        // Validate phone number uniqueness if provided
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber) && 
            await _userRepository.PhoneNumberExistsAsync(request.PhoneNumber))
        {
            throw new InvalidOperationException("Phone number already exists");
        }

        // Hash password
        var passwordHash = PasswordHasher.HashPassword(request.Password);

        var user = new User
        {
            PersonalEmail = request.PersonalEmail,
            InstitutionalEmail = request.InstitutionalEmail,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = passwordHash,
            FullName = request.FullName,
            Role = request.Role,
            IsActive = request.IsActive
        };

        var createdUser = await _userRepository.CreateAsync(user);

        return new UserResponse
        {
            Id = createdUser.Id,
            PersonalEmail = createdUser.PersonalEmail,
            InstitutionalEmail = createdUser.InstitutionalEmail,
            PhoneNumber = createdUser.PhoneNumber,
            ProfileImagePath = createdUser.ProfileImagePath,
            FullName = createdUser.FullName,
            Role = createdUser.Role,
            IsActive = createdUser.IsActive,
            CreatedAt = createdUser.CreatedAt,
            UpdatedAt = createdUser.UpdatedAt
        };
    }

    public async Task<UserResponse> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {id} not found");
        }

        // Validate personal email uniqueness if being changed
        if (!string.IsNullOrWhiteSpace(request.PersonalEmail) && request.PersonalEmail != user.PersonalEmail)
        {
            if (await _userRepository.PersonalEmailExistsAsync(request.PersonalEmail, id))
            {
                throw new InvalidOperationException("Personal email already exists");
            }
            user.PersonalEmail = request.PersonalEmail;
        }

        // Validate institutional email uniqueness if being changed
        if (request.InstitutionalEmail != null && request.InstitutionalEmail != user.InstitutionalEmail)
        {
            if (!string.IsNullOrWhiteSpace(request.InstitutionalEmail) && 
                await _userRepository.InstitutionalEmailExistsAsync(request.InstitutionalEmail, id))
            {
                throw new InvalidOperationException("Institutional email already exists");
            }
            user.InstitutionalEmail = string.IsNullOrWhiteSpace(request.InstitutionalEmail) ? null : request.InstitutionalEmail;
        }

        // Validate phone number uniqueness if being changed
        if (request.PhoneNumber != null && request.PhoneNumber != user.PhoneNumber)
        {
            if (!string.IsNullOrWhiteSpace(request.PhoneNumber) && 
                await _userRepository.PhoneNumberExistsAsync(request.PhoneNumber, id))
            {
                throw new InvalidOperationException("Phone number already exists");
            }
            user.PhoneNumber = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber;
        }

        // Update profile image path if provided
        if (request.ProfileImagePath != null)
        {
            user.ProfileImagePath = string.IsNullOrWhiteSpace(request.ProfileImagePath) ? null : request.ProfileImagePath;
        }

        // Update fields if provided
        if (!string.IsNullOrWhiteSpace(request.FullName))
            user.FullName = request.FullName;

        if (!string.IsNullOrWhiteSpace(request.Role))
            user.Role = request.Role;

        if (request.IsActive.HasValue)
            user.IsActive = request.IsActive.Value;

        var updatedUser = await _userRepository.UpdateAsync(user);

        return new UserResponse
        {
            Id = updatedUser.Id,
            PersonalEmail = updatedUser.PersonalEmail,
            InstitutionalEmail = updatedUser.InstitutionalEmail,
            PhoneNumber = updatedUser.PhoneNumber,
            ProfileImagePath = updatedUser.ProfileImagePath,
            FullName = updatedUser.FullName,
            Role = updatedUser.Role,
            IsActive = updatedUser.IsActive,
            CreatedAt = updatedUser.CreatedAt,
            UpdatedAt = updatedUser.UpdatedAt
        };
    }

    public async Task<bool> ChangePasswordAsync(int id, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {id} not found");
        }

        // Verify current password
        if (!PasswordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        // Hash new password
        user.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);

        return true;
    }

    public async Task<bool> AdminResetPasswordAsync(int id, AdminResetPasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {id} not found");
        }

        // Hash new password (admin resets without verifying current password)
        user.PasswordHash = PasswordHasher.HashPassword(request.NewPassword);
        await _userRepository.UpdateAsync(user);

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (!await _userRepository.ExistsAsync(id))
        {
            throw new KeyNotFoundException($"User with ID {id} not found");
        }

        return await _userRepository.DeleteAsync(id);
    }

    public async Task UpdateProfileImageAsync(int id, string? profileImagePath)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {id} not found");
        }

        user.ProfileImagePath = profileImagePath;
        await _userRepository.UpdateAsync(user);
    }

    #region Bulk Import Operations

    public async Task<BulkUserValidationResponse> ValidateUserImportAsync(Stream fileStream, string fileExtension)
    {
        var response = new BulkUserValidationResponse();

        // Parse file
        List<UserImportRowData> records;
        List<ExcelParseError> parseErrors;

        if (fileExtension.Equals(".xlsx", StringComparison.OrdinalIgnoreCase) ||
            fileExtension.Equals(".xls", StringComparison.OrdinalIgnoreCase))
        {
            (records, parseErrors) = ExcelHelperService.ParseUserImportExcel(fileStream);
        }
        else
        {
            // CSV parsing using CsvHelper
            var csvResult = await CsvHelperService.ParseCsvWithErrorsAsync<UserCsvImportRequest>(fileStream);
            records = csvResult.Records.Select((r, i) => new UserImportRowData
            {
                RowNumber = i + 2,
                PersonalEmail = r.PersonalEmail,
                InstitutionalEmail = r.InstitutionalEmail,
                PhoneNumber = r.PhoneNumber,
                FullName = r.FullName,
                Password = r.Password,
                Role = r.Role,
                IsActive = r.IsActive
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
            response.Rows.Add(new UserValidationRow
            {
                RowNumber = error.RowNumber,
                PersonalEmail = error.RawData ?? "",
                IsValid = false,
                Errors = new List<string> { error.ErrorMessage }
            });
            response.InvalidRows++;
        }

        var validRoles = new[] { "Admin", "Faculty", "Student" };

        // Validate each record
        foreach (var record in records)
        {
            var validationRow = new UserValidationRow
            {
                RowNumber = record.RowNumber,
                PersonalEmail = record.PersonalEmail,
                InstitutionalEmail = record.InstitutionalEmail,
                PhoneNumber = record.PhoneNumber,
                FullName = record.FullName,
                Role = record.Role,
                IsActive = record.IsActive,
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
                // Check for existing user
                var existingUser = await _userRepository.GetByEmailAsync(record.PersonalEmail);
                if (existingUser != null)
                {
                    validationRow.HasConflict = true;
                    validationRow.ExistingUserId = existingUser.Id;
                    validationRow.ExistingUserName = existingUser.FullName;
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

            // Validate role
            if (!validRoles.Contains(record.Role, StringComparer.OrdinalIgnoreCase))
            {
                validationRow.Errors.Add($"Invalid role '{record.Role}'. Valid: Admin, Faculty, Student");
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

    public async Task<BulkOperationResponse<UserResponse>> ImportUsersWithValidationAsync(BulkUserImportRequest request)
    {
        var response = new BulkOperationResponse<UserResponse>();
        response.TotalRecords = request.Rows.Count;

        foreach (var row in request.Rows)
        {
            try
            {
                // Check for existing user
                var existingUser = await _userRepository.GetByEmailAsync(row.PersonalEmail);
                
                if (existingUser != null)
                {
                    switch (request.ConflictResolution.ToLower())
                    {
                        case "skip":
                            response.ErrorCount++;
                            response.Errors.Add(new BulkOperationError
                            {
                                RowNumber = row.RowNumber,
                                Identifier = row.PersonalEmail,
                                ErrorMessage = "User already exists (skipped)"
                            });
                            continue;

                        case "update":
                            existingUser.FullName = row.FullName;
                            existingUser.InstitutionalEmail = string.IsNullOrWhiteSpace(row.InstitutionalEmail) ? null : row.InstitutionalEmail;
                            existingUser.PhoneNumber = string.IsNullOrWhiteSpace(row.PhoneNumber) ? null : row.PhoneNumber;
                            existingUser.Role = row.Role;
                            existingUser.IsActive = row.IsActive;
                            existingUser.UpdatedAt = DateTime.UtcNow;

                            var updated = await _userRepository.UpdateAsync(existingUser);
                            response.SuccessCount++;
                            response.SuccessfulRecords.Add(MapToResponse(updated));
                            continue;

                        default: // error
                            response.ErrorCount++;
                            response.Errors.Add(new BulkOperationError
                            {
                                RowNumber = row.RowNumber,
                                Identifier = row.PersonalEmail,
                                ErrorMessage = "User already exists"
                            });
                            continue;
                    }
                }

                // Create new user
                var user = new User
                {
                    PersonalEmail = row.PersonalEmail,
                    InstitutionalEmail = string.IsNullOrWhiteSpace(row.InstitutionalEmail) ? null : row.InstitutionalEmail,
                    PhoneNumber = string.IsNullOrWhiteSpace(row.PhoneNumber) ? null : row.PhoneNumber,
                    FullName = row.FullName,
                    PasswordHash = PasswordHasher.HashPassword(row.Password),
                    Role = row.Role,
                    IsActive = row.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                var created = await _userRepository.CreateAsync(user);
                response.SuccessCount++;
                response.SuccessfulRecords.Add(MapToResponse(created));
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

    public Task<byte[]> GetUserImportTemplateAsync()
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Users");

        // Headers
        var headers = new[] { "Personal Email", "Institutional Email", "Phone Number", "Full Name", "Password", "Role", "Is Active" };
        for (int i = 0; i < headers.Length; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightGray;
        }

        // Sample data
        worksheet.Cell(2, 1).Value = "john.doe@example.com";
        worksheet.Cell(2, 2).Value = "john.doe@university.edu";
        worksheet.Cell(2, 3).Value = "+1234567890";
        worksheet.Cell(2, 4).Value = "John Doe";
        worksheet.Cell(2, 5).Value = "Password123";
        worksheet.Cell(2, 6).Value = "Student";
        worksheet.Cell(2, 7).Value = "Yes";

        // Add validation dropdown for Role
        var roleRange = worksheet.Range(2, 6, 1000, 6);
        roleRange.SetDataValidation().List("Admin,Faculty,Student");

        // Add validation dropdown for IsActive
        var activeRange = worksheet.Range(2, 7, 1000, 7);
        activeRange.SetDataValidation().List("Yes,No");

        worksheet.Columns().AdjustToContents();
        worksheet.SheetView.FreezeRows(1);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return Task.FromResult(stream.ToArray());
    }

    private static UserResponse MapToResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            PersonalEmail = user.PersonalEmail,
            InstitutionalEmail = user.InstitutionalEmail,
            PhoneNumber = user.PhoneNumber,
            ProfileImagePath = user.ProfileImagePath,
            FullName = user.FullName,
            Role = user.Role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
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