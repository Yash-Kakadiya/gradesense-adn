using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Faculty.Request;
using GradeSense.API.DTOs.Faculty.Response;

namespace GradeSense.API.Interfaces.Services
{
    public interface IFacultyService
    {
        Task<PagedResponse<FacultyListResponse>> GetAllAsync(FacultyFilterRequest filter);
        Task<FacultyDetailResponse?> GetByIdAsync(int id);
        Task<FacultyResponse> CreateAsync(CreateFacultyRequest request);
        Task<FacultyResponse> UpdateAsync(int id, UpdateFacultyRequest request);
        Task<bool> DeleteAsync(int id);
    }
}