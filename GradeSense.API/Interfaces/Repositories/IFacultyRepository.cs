using GradeSense.API.DTOs.Faculty.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface IFacultyRepository
    {
        Task<Faculty?> GetByIdAsync(int id);
        Task<Faculty?> GetByEmployeeIdAsync(string employeeId);
        Task<Faculty?> GetByUserIdAsync(int userId);
        Task<(List<Faculty> Faculties, int TotalCount)> GetAllAsync(FacultyFilterRequest filter);
        Task<Faculty> CreateAsync(Faculty faculty);
        Task<Faculty> UpdateAsync(Faculty faculty);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> EmployeeIdExistsAsync(string employeeId, int? excludeId = null);
        Task<bool> UserIdExistsAsync(int userId);
        Task<int> GetAssignedCoursesCountAsync(int facultyId);
        Task<int> GetCoordinatingBatchesCountAsync(int facultyId);
        Task<int> GetCoordinatingCoursesCountAsync(int facultyId);
    }
}