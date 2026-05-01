using GradeSense.API.DTOs.Prediction.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface IPredictionRepository
    {
        Task<Prediction?> GetByIdAsync(string id);
        Task<(List<Prediction> Predictions, int TotalCount)> GetAllAsync(PredictionFilterRequest filter);
        Task<Prediction> CreateAsync(Prediction prediction);
        Task<Prediction> UpdateAsync(Prediction prediction);
        Task<bool> DeleteAsync(string id);
        Task<int> DeleteByEnrollmentIdAsync(int enrollmentId);
        Task<int> DeactivateByEnrollmentIdAsync(int enrollmentId);
        Task<bool> ExistsAsync(string id);
    }
}