using GradeSense.API.DTOs.User.Request;
using GradeSense.API.DTOs.User.Response;
using GradeSense.API.DTOs.Common;

namespace GradeSense.API.Interfaces.Services;

public interface IUserService
{
    Task<UserDetailResponse?> GetByIdAsync(int id);
    Task<PagedResponse<UserListResponse>> GetAllAsync(UserFilterRequest filter);
    Task<UserResponse> CreateAsync(CreateUserRequest request);
    Task<UserResponse> UpdateAsync(int id, UpdateUserRequest request);
    Task<bool> ChangePasswordAsync(int id, ChangePasswordRequest request);
    Task<bool> AdminResetPasswordAsync(int id, AdminResetPasswordRequest request);
    Task<bool> DeleteAsync(int id);
    Task UpdateProfileImageAsync(int id, string? profileImagePath);

    // Bulk Import Operations
    Task<BulkUserValidationResponse> ValidateUserImportAsync(Stream fileStream, string fileExtension);
    Task<BulkOperationResponse<UserResponse>> ImportUsersWithValidationAsync(BulkUserImportRequest request);
    Task<byte[]> GetUserImportTemplateAsync();
}