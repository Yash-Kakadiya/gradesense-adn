using GradeSense.API.Data;
using GradeSense.API.DTOs.UploadHistory.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class UploadHistoryRepository : IUploadHistoryRepository
    {
        private readonly GradeSenseDbContext _context;

        public UploadHistoryRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<UploadHistory?> GetByIdAsync(string id)
        {
            return await _context.UploadHistories
                .Include(uh => uh.CourseOffering)
                    .ThenInclude(co => co.Subject)
                        .ThenInclude(s => s.Department)
                .Include(uh => uh.CourseOffering)
                    .ThenInclude(co => co.Batch)
                .Include(uh => uh.AssessmentItem)
                .Include(uh => uh.UploadedByNavigation)
                    .ThenInclude(f => f.IdNavigation)
                .FirstOrDefaultAsync(uh => uh.Id == id && uh.DeletedAt == null);
        }

        public async Task<(List<UploadHistory> UploadHistories, int TotalCount)> GetAllAsync(UploadHistoryFilterRequest filter)
        {
            var query = _context.UploadHistories
                .Include(uh => uh.CourseOffering)
                    .ThenInclude(co => co.Subject)
                .Include(uh => uh.CourseOffering)
                    .ThenInclude(co => co.Batch)
                .Include(uh => uh.AssessmentItem)
                .Include(uh => uh.UploadedByNavigation)
                    .ThenInclude(f => f.IdNavigation)
                .Where(uh => uh.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(uh =>
                    uh.FileName.ToLower().Contains(searchTerm) ||
                    uh.CourseOffering.Subject.Code.ToLower().Contains(searchTerm) ||
                    uh.CourseOffering.Subject.Name.ToLower().Contains(searchTerm) ||
                    uh.UploadedByNavigation.IdNavigation.FullName.ToLower().Contains(searchTerm));
            }

            if (filter.CourseOfferingId.HasValue)
            {
                query = query.Where(uh => uh.CourseOfferingId == filter.CourseOfferingId.Value);
            }

            if (filter.AssessmentItemId.HasValue)
            {
                query = query.Where(uh => uh.AssessmentItemId == filter.AssessmentItemId.Value);
            }

            if (filter.UploadedBy.HasValue)
            {
                query = query.Where(uh => uh.UploadedBy == filter.UploadedBy.Value);
            }

            if (filter.SubjectId.HasValue)
            {
                query = query.Where(uh => uh.CourseOffering.SubjectId == filter.SubjectId.Value);
            }

            if (filter.BatchId.HasValue)
            {
                query = query.Where(uh => uh.CourseOffering.BatchId == filter.BatchId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Status))
            {
                query = query.Where(uh => uh.Status == filter.Status);
            }

            if (filter.FromDate.HasValue)
            {
                query = query.Where(uh => uh.UploadedAt >= filter.FromDate.Value);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(uh => uh.UploadedAt <= filter.ToDate.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(uh => EF.Property<object>(uh, filter.SortBy))
                : query.OrderBy(uh => EF.Property<object>(uh, filter.SortBy));

            // Apply pagination
            var uploadHistories = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (uploadHistories, totalCount);
        }

        public async Task<UploadHistory> CreateAsync(UploadHistory uploadHistory)
        {
            uploadHistory.CreatedAt = DateTime.Now;
            _context.UploadHistories.Add(uploadHistory);
            await _context.SaveChangesAsync();
            return uploadHistory;
        }

        public async Task<UploadHistory> UpdateAsync(UploadHistory uploadHistory)
        {
            uploadHistory.UpdatedAt = DateTime.Now;
            _context.UploadHistories.Update(uploadHistory);
            await _context.SaveChangesAsync();
            return uploadHistory;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var uploadHistory = await _context.UploadHistories.FindAsync(id);
            if (uploadHistory == null) return false;

            // Soft delete
            uploadHistory.DeletedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await _context.UploadHistories.AnyAsync(uh => uh.Id == id && uh.DeletedAt == null);
        }
    }
}