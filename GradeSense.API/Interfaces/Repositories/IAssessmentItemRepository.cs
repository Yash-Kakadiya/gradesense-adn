using GradeSense.API.DTOs.AssessmentItem.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface IAssessmentItemRepository
    {
        Task<AssessmentItem?> GetByIdAsync(int id);
        Task<(List<AssessmentItem> AssessmentItems, int TotalCount)> GetAllAsync(AssessmentItemFilterRequest filter);
        Task<AssessmentItem> CreateAsync(AssessmentItem assessmentItem);
        Task<AssessmentItem> UpdateAsync(AssessmentItem assessmentItem);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<int> GetStudentMarksCountAsync(int assessmentItemId);
        Task<int> GetUploadHistoriesCountAsync(int assessmentItemId);
    }
}