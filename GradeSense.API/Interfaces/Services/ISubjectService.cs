using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Subject.Request;
using GradeSense.API.DTOs.Subject.Response;

namespace GradeSense.API.Interfaces.Services
{
    public interface ISubjectService
    {
        Task<PagedResponse<SubjectListResponse>> GetAllAsync(SubjectFilterRequest filter);
        Task<SubjectDetailResponse?> GetByIdAsync(int id);
        Task<SubjectResponse> CreateAsync(CreateSubjectRequest request);
        Task<SubjectResponse> UpdateAsync(int id, UpdateSubjectRequest request);
        Task<bool> DeleteAsync(int id);
    }
}