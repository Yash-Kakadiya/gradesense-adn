using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Student.Request;
using GradeSense.API.DTOs.Student.Response;

namespace GradeSense.API.Interfaces.Services
{
    public interface IStudentService
    {
        Task<PagedResponse<StudentListResponse>> GetAllAsync(StudentFilterRequest filter);
        Task<StudentDetailResponse?> GetByIdAsync(int id);
        Task<StudentResponse> CreateAsync(CreateStudentRequest request);
        Task<StudentResponse> UpdateAsync(int id, UpdateStudentRequest request);
        Task<bool> DeleteAsync(int id);

        // Bulk Operations
        Task<BulkOperationResponse<StudentResponse>> BulkImportFromCsvAsync(Stream csvStream);
        Task<byte[]> ExportToCsvAsync(StudentExportFilterRequest filter);
        Task<byte[]> GetImportTemplateAsync();

        // Bulk Import with Validation
        Task<BulkStudentValidationResponse> ValidateStudentImportAsync(Stream fileStream, string fileExtension);
        Task<BulkOperationResponse<StudentResponse>> ImportStudentsWithValidationAsync(BulkStudentImportRequest request);
        Task<byte[]> GetStudentImportTemplateAsync();
    }
}