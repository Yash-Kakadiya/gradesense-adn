using GradeSense.API.DTOs.Department.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface IDepartmentRepository
    {
        Task<Department?> GetByIdAsync(int id);
        Task<Department?> GetByNameAsync(string name);
        Task<Department?> GetByCodeAsync(string code);
        Task<(List<Department> Departments, int TotalCount)> GetAllAsync(DepartmentFilterRequest filter);
        Task<List<Department>> GetAllForLookupAsync();
        Task<Department> CreateAsync(Department department);
        Task<Department> UpdateAsync(Department department);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> NameExistsAsync(string name, int? excludeId = null);
        Task<bool> CodeExistsAsync(string code, int? excludeId = null);
        Task<int> GetFacultyCountAsync(int departmentId);
        Task<int> GetStudentCountAsync(int departmentId);
        Task<int> GetSubjectCountAsync(int departmentId);
        Task<int> GetBatchCountAsync(int departmentId);
    }
}
