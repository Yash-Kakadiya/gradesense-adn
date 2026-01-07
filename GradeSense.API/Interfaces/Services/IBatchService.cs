using GradeSense.API.DTOs.Batch.Request;
using GradeSense.API.DTOs.Batch.Response;
using GradeSense.API.DTOs.Common;

namespace GradeSense.API.Interfaces.Services
{
    public interface IBatchService
    {
        Task<PagedResponse<BatchListResponse>> GetAllAsync(BatchFilterRequest filter);
        Task<BatchDetailResponse?> GetByIdAsync(int id);
        Task<BatchResponse> CreateAsync(CreateBatchRequest request);
        Task<BatchResponse> UpdateAsync(int id, UpdateBatchRequest request);
        Task<bool> DeleteAsync(int id);
    }
}