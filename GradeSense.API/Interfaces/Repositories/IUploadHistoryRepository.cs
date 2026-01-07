using GradeSense.API.DTOs.UploadHistory.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface IUploadHistoryRepository
    {
        Task<UploadHistory?> GetByIdAsync(string id);
        Task<(List<UploadHistory> UploadHistories, int TotalCount)> GetAllAsync(UploadHistoryFilterRequest filter);
        Task<UploadHistory> CreateAsync(UploadHistory uploadHistory);
        Task<UploadHistory> UpdateAsync(UploadHistory uploadHistory);
        Task<bool> DeleteAsync(string id);
        Task<bool> ExistsAsync(string id);
    }
}