using GradeSense.API.Data;
using GradeSense.API.DTOs.AuditLog.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly GradeSenseDbContext _context;

        public AuditLogRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<AuditLog?> GetByIdAsync(long id)
        {
            return await _context.AuditLogs
                .Include(al => al.ActorUser)
                .FirstOrDefaultAsync(al => al.Id == id && al.DeletedAt == null);
        }

        public async Task<(List<AuditLog> AuditLogs, int TotalCount)> GetAllAsync(AuditLogFilterRequest filter)
        {
            var query = _context.AuditLogs
                .Include(al => al.ActorUser)
                .Where(al => al.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(al =>
                    al.Action.ToLower().Contains(searchTerm) ||
                    al.EntityName.ToLower().Contains(searchTerm) ||
                    al.EntityId.ToLower().Contains(searchTerm) ||
                    (al.ActorUser != null && al.ActorUser.FullName.ToLower().Contains(searchTerm)) ||
                    (al.ActorUser != null && al.ActorUser.PersonalEmail.ToLower().Contains(searchTerm)) ||
                    (al.ActorUser != null && al.ActorUser.InstitutionalEmail != null && al.ActorUser.InstitutionalEmail.ToLower().Contains(searchTerm)) ||
                    (al.Reason != null && al.Reason.ToLower().Contains(searchTerm)));
            }

            if (filter.ActorUserId.HasValue)
            {
                query = query.Where(al => al.ActorUserId == filter.ActorUserId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.EntityName))
            {
                query = query.Where(al => al.EntityName == filter.EntityName);
            }

            if (!string.IsNullOrWhiteSpace(filter.EntityId))
            {
                query = query.Where(al => al.EntityId == filter.EntityId);
            }

            if (!string.IsNullOrWhiteSpace(filter.Action))
            {
                query = query.Where(al => al.Action == filter.Action);
            }

            if (filter.StartDate.HasValue)
            {
                query = query.Where(al => al.OccurredAt >= filter.StartDate.Value);
            }

            if (filter.EndDate.HasValue)
            {
                query = query.Where(al => al.OccurredAt <= filter.EndDate.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.IPAddress))
            {
                query = query.Where(al => al.Ipaddress == filter.IPAddress);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(al => EF.Property<object>(al, filter.SortBy))
                : query.OrderBy(al => EF.Property<object>(al, filter.SortBy));

            // Apply pagination
            var auditLogs = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (auditLogs, totalCount);
        }

        public async Task<AuditLog> CreateAsync(AuditLog auditLog)
        {
            auditLog.CreatedAt = DateTime.Now;
            auditLog.OccurredAt ??= DateTime.Now;
            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();
            return auditLog;
        }

        public async Task<AuditLog> UpdateAsync(AuditLog auditLog)
        {
            auditLog.UpdatedAt = DateTime.Now;
            _context.AuditLogs.Update(auditLog);
            await _context.SaveChangesAsync();
            return auditLog;
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var auditLog = await _context.AuditLogs.FindAsync(id);
            if (auditLog == null) return false;

            // Soft delete
            auditLog.DeletedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(long id)
        {
            return await _context.AuditLogs.AnyAsync(al => al.Id == id && al.DeletedAt == null);
        }
    }
}