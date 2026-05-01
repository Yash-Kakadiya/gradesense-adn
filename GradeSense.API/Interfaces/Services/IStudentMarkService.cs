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
        Task<BulkStudentMarkResponse> BulkEntrySaveAsync(BulkStudentMarkRequest request);
        Task<BulkOperationResponse<StudentMarkResponse>> BulkImportGradesAsync(int assessmentItemId, int graderId, Stream csvStream);
        Task<byte[]> ExportGradesToCsvAsync(StudentMarkExportFilterRequest filter);
        Task<byte[]> GetGradeTemplateAsync(int assessmentItemId);
        
        // Enhanced Bulk Operations (Excel support, validation, conflict resolution)
        Task<BulkGradeValidationResponse> ValidateGradeImportAsync(int assessmentItemId, Stream fileStream, string fileType);
        Task<BulkOperationResponse<StudentMarkResponse>> ImportGradesWithValidationAsync(BulkGradeImportRequest request);
        Task<byte[]> GetGradeTemplateExcelAsync(int assessmentItemId);
    }
}