using GradeSense.API.DTOs.Batch.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface IBatchRepository
    {
        Task<Batch?> GetByIdAsync(int id);
        Task<(List<Batch> Batches, int TotalCount)> GetAllAsync(BatchFilterRequest filter);
        Task<Batch> CreateAsync(Batch batch);
        Task<Batch> UpdateAsync(Batch batch);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<int> GetCourseOfferingsCountAsync(int batchId);
    }
}