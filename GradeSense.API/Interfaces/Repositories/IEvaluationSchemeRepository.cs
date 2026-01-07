using GradeSense.API.DTOs.EvaluationScheme.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface IEvaluationSchemeRepository
    {
        Task<EvaluationScheme?> GetByIdAsync(int id);
        Task<(List<EvaluationScheme> EvaluationSchemes, int TotalCount)> GetAllAsync(EvaluationSchemeFilterRequest filter);
        Task<EvaluationScheme> CreateAsync(EvaluationScheme evaluationScheme);
        Task<EvaluationScheme> UpdateAsync(EvaluationScheme evaluationScheme);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<int> GetAssessmentItemsCountAsync(int evaluationSchemeId);
        Task<decimal> GetTotalWeightForCourseOfferingAsync(int courseOfferingId, int? excludeId = null);
    }
}