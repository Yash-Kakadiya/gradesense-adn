using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.FacultyAssignment.Request;
using GradeSense.API.DTOs.FacultyAssignment.Response;

namespace GradeSense.API.Interfaces.Services
{
    public interface IFacultyAssignmentService
    {
        Task<PagedResponse<FacultyAssignmentListResponse>> GetAllAsync(FacultyAssignmentFilterRequest filter);
        Task<FacultyAssignmentDetailResponse?> GetByIdAsync(int id);
        Task<FacultyAssignmentResponse> CreateAsync(CreateFacultyAssignmentRequest request);
        Task<FacultyAssignmentResponse> UpdateAsync(int id, UpdateFacultyAssignmentRequest request);
        Task<bool> DeleteAsync(int id);
    }
}