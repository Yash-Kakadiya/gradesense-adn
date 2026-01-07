using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Department.Request;
using GradeSense.API.DTOs.Department.Response;

namespace GradeSense.API.Interfaces.Services
{
    public interface IDepartmentService
    {
        Task<PagedResponse<DepartmentResponse>> GetAllAsync(DepartmentFilterRequest filter);
        Task<DepartmentDetailResponse?> GetByIdAsync(int id);
        Task<DepartmentResponse> CreateAsync(CreateDepartmentRequest request);
        Task<DepartmentResponse> UpdateAsync(int id, UpdateDepartmentRequest request);
        Task<bool> DeleteAsync(int id);
    }
}
