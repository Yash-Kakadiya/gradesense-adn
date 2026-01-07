using GradeSense.API.DTOs.AuditLog.Request;
using GradeSense.API.DTOs.AuditLog.Response;
using GradeSense.API.DTOs.Common;

namespace GradeSense.API.Interfaces.Services
{
    public interface IAuditLogService
    {
        Task<PagedResponse<AuditLogListResponse>> GetAllAsync(AuditLogFilterRequest filter);
        Task<AuditLogDetailResponse?> GetByIdAsync(long id);
        Task<AuditLogResponse> CreateAsync(CreateAuditLogRequest request);
        Task<AuditLogResponse> UpdateAsync(long id, UpdateAuditLogRequest request);
        Task<bool> DeleteAsync(long id);
    }
}