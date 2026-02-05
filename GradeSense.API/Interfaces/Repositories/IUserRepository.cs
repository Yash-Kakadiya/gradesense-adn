using GradeSense.API.Models;
using GradeSense.API.DTOs.User.Request;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByEmailAsync(string email);
        Task<(List<User> Users, int TotalCount)> GetAllAsync(UserFilterRequest filter);
        Task<User> CreateAsync(User user);
        Task<User> UpdateAsync(User user);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> PersonalEmailExistsAsync(string email, int? excludeUserId = null);
        Task<bool> InstitutionalEmailExistsAsync(string email, int? excludeUserId = null);
        Task<bool> PhoneNumberExistsAsync(string phoneNumber, int? excludeUserId = null);
    }
}