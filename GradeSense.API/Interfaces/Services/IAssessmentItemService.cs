using GradeSense.API.DTOs.AssessmentItem.Request;
using GradeSense.API.DTOs.AssessmentItem.Response;
using GradeSense.API.DTOs.Common;

namespace GradeSense.API.Interfaces.Services
{
    public interface IAssessmentItemService
    {
        Task<PagedResponse<AssessmentItemListResponse>> GetAllAsync(AssessmentItemFilterRequest filter);
        Task<AssessmentItemDetailResponse?> GetByIdAsync(int id);
        Task<AssessmentItemResponse> CreateAsync(CreateAssessmentItemRequest request);
        Task<AssessmentItemResponse> UpdateAsync(int id, UpdateAssessmentItemRequest request);
        Task<bool> DeleteAsync(int id);
    }
}