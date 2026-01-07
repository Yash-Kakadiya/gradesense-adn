using GradeSense.API.DTOs.AuditLog.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface IAuditLogRepository
    {
        Task<AuditLog?> GetByIdAsync(long id);
        Task<(List<AuditLog> AuditLogs, int TotalCount)> GetAllAsync(AuditLogFilterRequest filter);
        Task<AuditLog> CreateAsync(AuditLog auditLog);
        Task<AuditLog> UpdateAsync(AuditLog auditLog);
        Task<bool> DeleteAsync(long id);
        Task<bool> ExistsAsync(long id);
    }
}