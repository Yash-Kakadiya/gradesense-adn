using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.CourseEnrollment.Request;
using GradeSense.API.DTOs.CourseEnrollment.Response;

namespace GradeSense.API.Interfaces.Services
{
    public interface ICourseEnrollmentService
    {
        Task<PagedResponse<CourseEnrollmentListResponse>> GetAllAsync(CourseEnrollmentFilterRequest filter);
        Task<CourseEnrollmentDetailResponse?> GetByIdAsync(int id);
        Task<CourseEnrollmentResponse> CreateAsync(CreateCourseEnrollmentRequest request);
        Task<CourseEnrollmentResponse> UpdateAsync(int id, UpdateCourseEnrollmentRequest request);
        Task<bool> DeleteAsync(int id);
        Task<BulkEnrollResponse> BulkEnrollAsync(BulkEnrollRequest request);
    }
}