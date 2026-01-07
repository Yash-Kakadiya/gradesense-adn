using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.EvaluationScheme.Request;
using GradeSense.API.DTOs.EvaluationScheme.Response;

namespace GradeSense.API.Interfaces.Services
{
    public interface IEvaluationSchemeService
    {
        Task<PagedResponse<EvaluationSchemeListResponse>> GetAllAsync(EvaluationSchemeFilterRequest filter);
        Task<EvaluationSchemeDetailResponse?> GetByIdAsync(int id);
        Task<EvaluationSchemeResponse> CreateAsync(CreateEvaluationSchemeRequest request);
        Task<EvaluationSchemeResponse> UpdateAsync(int id, UpdateEvaluationSchemeRequest request);
        Task<bool> DeleteAsync(int id);
    }
}