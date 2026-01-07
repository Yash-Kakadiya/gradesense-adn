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
            Email = user.Email,
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
            Email = u.Email,
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
        // Validate email uniqueness
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            throw new InvalidOperationException("Email already exists");
        }

        // Hash password
        var passwordHash = PasswordHasher.HashPassword(request.Password);

        var user = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            FullName = request.FullName,
            Role = request.Role,
            IsActive = request.IsActive
        };

        var createdUser = await _userRepository.CreateAsync(user);

        return new UserResponse
        {
            Id = createdUser.Id,
            Email = createdUser.Email,
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

        // Validate email uniqueness if email is being changed
        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
        {
            if (await _userRepository.EmailExistsAsync(request.Email, id))
            {
                throw new InvalidOperationException("Email already exists");
            }
            user.Email = request.Email;
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
            Email = updatedUser.Email,
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
}