using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.StudentMark.Request;
using GradeSense.API.DTOs.StudentMark.Response;

namespace GradeSense.API.Interfaces.Services
{
    public interface IStudentMarkService
    {
        Task<PagedResponse<StudentMarkListResponse>> GetAllAsync(StudentMarkFilterRequest filter);
        Task<StudentMarkDetailResponse?> GetByIdAsync(int id);
        Task<StudentMarkResponse> CreateAsync(CreateStudentMarkRequest request);
        Task<StudentMarkResponse> UpdateAsync(int id, UpdateStudentMarkRequest request);
        Task<bool> DeleteAsync(int id);

        // Bulk Operations
        Task<BulkOperationResponse<StudentMarkResponse>> BulkImportGradesAsync(int assessmentItemId, int graderId, Stream csvStream);
        Task<byte[]> ExportGradesToCsvAsync(StudentMarkExportFilterRequest filter);
        Task<byte[]> GetGradeTemplateAsync(int assessmentItemId);
    }
}