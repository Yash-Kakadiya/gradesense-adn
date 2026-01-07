using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.SubjectUnit.Request;
using GradeSense.API.DTOs.SubjectUnit.Response;

namespace GradeSense.API.Interfaces.Services
{
    public interface ISubjectUnitService
    {
        Task<PagedResponse<SubjectUnitListResponse>> GetAllAsync(SubjectUnitFilterRequest filter);
        Task<SubjectUnitDetailResponse?> GetByIdAsync(int id);
        Task<SubjectUnitResponse> CreateAsync(CreateSubjectUnitRequest request);
        Task<SubjectUnitResponse> UpdateAsync(int id, UpdateSubjectUnitRequest request);
        Task<bool> DeleteAsync(int id);
    }
}