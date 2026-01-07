using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.CourseOffering.Request;
using GradeSense.API.DTOs.CourseOffering.Response;

namespace GradeSense.API.Interfaces.Services
{
    public interface ICourseOfferingService
    {
        Task<PagedResponse<CourseOfferingListResponse>> GetAllAsync(CourseOfferingFilterRequest filter);
        Task<CourseOfferingDetailResponse?> GetByIdAsync(int id);
        Task<CourseOfferingResponse> CreateAsync(CreateCourseOfferingRequest request);
        Task<CourseOfferingResponse> UpdateAsync(int id, UpdateCourseOfferingRequest request);
        Task<bool> DeleteAsync(int id);
    }
}