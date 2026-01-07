using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Prediction.Request;
using GradeSense.API.DTOs.Prediction.Response;

namespace GradeSense.API.Interfaces.Services
{
    public interface IPredictionService
    {
        Task<PagedResponse<PredictionListResponse>> GetAllAsync(PredictionFilterRequest filter);
        Task<PredictionDetailResponse?> GetByIdAsync(string id);
        Task<PredictionResponse> CreateAsync(CreatePredictionRequest request);
        Task<PredictionResponse> UpdateAsync(string id, UpdatePredictionRequest request);
        Task<bool> DeleteAsync(string id);
    }
}