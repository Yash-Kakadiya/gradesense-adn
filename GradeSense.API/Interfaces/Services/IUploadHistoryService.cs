using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.UploadHistory.Request;
using GradeSense.API.DTOs.UploadHistory.Response;

namespace GradeSense.API.Interfaces.Services
{
    public interface IUploadHistoryService
    {
        Task<PagedResponse<UploadHistoryListResponse>> GetAllAsync(UploadHistoryFilterRequest filter);
        Task<UploadHistoryDetailResponse?> GetByIdAsync(string id);
        Task<UploadHistoryResponse> CreateAsync(CreateUploadHistoryRequest request);
        Task<UploadHistoryResponse> UpdateAsync(string id, UpdateUploadHistoryRequest request);
        Task<bool> DeleteAsync(string id);
    }
}