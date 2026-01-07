using GradeSense.API.Data;
using GradeSense.API.DTOs.Batch.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class BatchRepository : IBatchRepository
    {
        private readonly GradeSenseDbContext _context;

        public BatchRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<Batch?> GetByIdAsync(int id)
        {
            return await _context.Batches
                .Include(b => b.Department)
                .Include(b => b.ClassCoordinator)
                    .ThenInclude(f => f.IdNavigation)
                .FirstOrDefaultAsync(b => b.Id == id && b.DeletedAt == null);
        }

        public async Task<(List<Batch> Batches, int TotalCount)> GetAllAsync(BatchFilterRequest filter)
        {
            var query = _context.Batches
                .Include(b => b.Department)
                .Include(b => b.ClassCoordinator)
                    .ThenInclude(f => f.IdNavigation)
                .Where(b => b.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(b =>
                    b.Name.ToLower().Contains(searchTerm) ||
                    (b.Division != null && b.Division.ToLower().Contains(searchTerm)));
            }

            if (filter.DepartmentId.HasValue)
            {
                query = query.Where(b => b.DepartmentId == filter.DepartmentId.Value);
            }

            if (filter.Semester.HasValue)
            {
                query = query.Where(b => b.Semester == filter.Semester.Value);
            }

            if (filter.AcademicYear.HasValue)
            {
                query = query.Where(b => b.AcademicYear == filter.AcademicYear.Value);
            }

            if (filter.ClassCoordinatorId.HasValue)
            {
                query = query.Where(b => b.ClassCoordinatorId == filter.ClassCoordinatorId.Value);
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(b => b.IsActive == filter.IsActive.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(b => EF.Property<object>(b, filter.SortBy))
                : query.OrderBy(b => EF.Property<object>(b, filter.SortBy));

            // Apply pagination
            var batches = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (batches, totalCount);
        }

        public async Task<Batch> CreateAsync(Batch batch)
        {
            batch.CreatedAt = DateTime.Now;
            _context.Batches.Add(batch);
            await _context.SaveChangesAsync();
            return batch;
        }

        public async Task<Batch> UpdateAsync(Batch batch)
        {
            batch.UpdatedAt = DateTime.Now;
            _context.Batches.Update(batch);
            await _context.SaveChangesAsync();
            return batch;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var batch = await _context.Batches.FindAsync(id);
            if (batch == null) return false;

            // Soft delete
            batch.DeletedAt = DateTime.Now;
            batch.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Batches.AnyAsync(b => b.Id == id && b.DeletedAt == null);
        }

        public async Task<int> GetCourseOfferingsCountAsync(int batchId)
        {
            return await _context.CourseOfferings
                .Where(co => co.BatchId == batchId && co.DeletedAt == null)
                .CountAsync();
        }
    }
}