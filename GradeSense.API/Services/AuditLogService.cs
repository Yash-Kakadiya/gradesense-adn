using GradeSense.API.DTOs.AuditLog.Request;
using GradeSense.API.DTOs.AuditLog.Response;
using GradeSense.API.DTOs.Common;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly IUserRepository _userRepository;

        public AuditLogService(
            IAuditLogRepository auditLogRepository,
            IUserRepository userRepository)
        {
            _auditLogRepository = auditLogRepository;
            _userRepository = userRepository;
        }

        public async Task<PagedResponse<AuditLogListResponse>> GetAllAsync(AuditLogFilterRequest filter)
        {
            var (auditLogs, total) = await _auditLogRepository.GetAllAsync(filter);

            var data = auditLogs.Select(al => new AuditLogListResponse
            {
                Id = al.Id,
                Action = al.Action,
                ActorUserName = al.ActorUser?.FullName ?? "System",
                EntityName = al.EntityName,
                EntityId = al.EntityId,
                ChangedFields = al.ChangedFields,
                OccurredAt = al.OccurredAt,
                IPAddress = al.Ipaddress
            }).ToList();

            return new PagedResponse<AuditLogListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<AuditLogDetailResponse?> GetByIdAsync(long id)
        {
            var auditLog = await _auditLogRepository.GetByIdAsync(id);
            if (auditLog == null) return null;

            return new AuditLogDetailResponse
            {
                Id = auditLog.Id,
                Action = auditLog.Action,
                ActorUserId = auditLog.ActorUserId,
                ActorUserName = auditLog.ActorUser?.FullName ?? "System",
                ActorUserEmail = auditLog.ActorUser?.PersonalEmail ?? string.Empty,
                ActorUserRole = auditLog.ActorUser?.Role ?? string.Empty,
                EntityName = auditLog.EntityName,
                EntityId = auditLog.EntityId,
                OldValue = auditLog.OldValue,
                NewValue = auditLog.NewValue,
                ChangedFields = auditLog.ChangedFields,
                OccurredAt = auditLog.OccurredAt,
                IPAddress = auditLog.Ipaddress,
                UserAgent = auditLog.UserAgent,
                SessionId = auditLog.SessionId,
                Reason = auditLog.Reason,
                CreatedAt = auditLog.CreatedAt,
                UpdatedAt = auditLog.UpdatedAt,
                DeletedAt = auditLog.DeletedAt
            };
        }

        public async Task<AuditLogResponse> CreateAsync(CreateAuditLogRequest request)
        {
            // Validate ActorUser exists
            if (!await _userRepository.ExistsAsync(request.ActorUserId))
                throw new KeyNotFoundException("Actor user not found");

            var auditLog = new AuditLog
            {
                Action = request.Action,
                ActorUserId = request.ActorUserId,
                EntityName = request.EntityName,
                EntityId = request.EntityId,
                OldValue = request.OldValue,
                NewValue = request.NewValue,
                ChangedFields = request.ChangedFields,
                OccurredAt = request.OccurredAt ?? DateTime.Now,
                Ipaddress = request.IPAddress,
                UserAgent = request.UserAgent,
                SessionId = request.SessionId,
                Reason = request.Reason
            };

            await _auditLogRepository.CreateAsync(auditLog);

            // Reload with navigation properties
            auditLog = await _auditLogRepository.GetByIdAsync(auditLog.Id);

            return new AuditLogResponse
            {
                Id = auditLog!.Id,
                Action = auditLog.Action,
                ActorUserId = auditLog.ActorUserId,
                ActorUserName = auditLog.ActorUser?.FullName ?? "System",
                ActorUserEmail = auditLog.ActorUser?.PersonalEmail ?? string.Empty,
                EntityName = auditLog.EntityName,
                EntityId = auditLog.EntityId,
                OldValue = auditLog.OldValue,
                NewValue = auditLog.NewValue,
                ChangedFields = auditLog.ChangedFields,
                OccurredAt = auditLog.OccurredAt,
                IPAddress = auditLog.Ipaddress,
                UserAgent = auditLog.UserAgent,
                SessionId = auditLog.SessionId,
                Reason = auditLog.Reason,
                CreatedAt = auditLog.CreatedAt,
                UpdatedAt = auditLog.UpdatedAt
            };
        }

        public async Task<AuditLogResponse> UpdateAsync(long id, UpdateAuditLogRequest request)
        {
            var auditLog = await _auditLogRepository.GetByIdAsync(id);
            if (auditLog == null)
                throw new KeyNotFoundException("Audit log not found");

            // Only allow updating Reason (typical use case: adding explanation)
            auditLog.Reason = request.Reason ?? auditLog.Reason;

            await _auditLogRepository.UpdateAsync(auditLog);

            // Reload with navigation properties
            auditLog = await _auditLogRepository.GetByIdAsync(id);

            return new AuditLogResponse
            {
                Id = auditLog!.Id,
                Action = auditLog.Action,
                ActorUserId = auditLog.ActorUserId,
                ActorUserName = auditLog.ActorUser?.FullName ?? "System",
                ActorUserEmail = auditLog.ActorUser?.PersonalEmail ?? string.Empty,
                EntityName = auditLog.EntityName,
                EntityId = auditLog.EntityId,
                OldValue = auditLog.OldValue,
                NewValue = auditLog.NewValue,
                ChangedFields = auditLog.ChangedFields,
                OccurredAt = auditLog.OccurredAt,
                IPAddress = auditLog.Ipaddress,
                UserAgent = auditLog.UserAgent,
                SessionId = auditLog.SessionId,
                Reason = auditLog.Reason,
                CreatedAt = auditLog.CreatedAt,
                UpdatedAt = auditLog.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(long id)
        {
            if (!await _auditLogRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Audit log not found");

            // No dependency checks - audit logs have no children
            return await _auditLogRepository.DeleteAsync(id);
        }
    }
}