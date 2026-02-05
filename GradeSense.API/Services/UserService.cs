using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.User.Request;
using GradeSense.API.DTOs.User.Response;
using GradeSense.API.Helpers;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;
using Microsoft.AspNetCore.Identity;

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
}