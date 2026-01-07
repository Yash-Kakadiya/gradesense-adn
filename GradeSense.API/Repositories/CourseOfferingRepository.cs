using GradeSense.API.Data;
using GradeSense.API.DTOs.CourseOffering.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class CourseOfferingRepository : ICourseOfferingRepository
    {
        private readonly GradeSenseDbContext _context;

        public CourseOfferingRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<CourseOffering?> GetByIdAsync(int id)
        {
            return await _context.CourseOfferings
                .Include(co => co.Subject)
                    .ThenInclude(s => s.Department)
                .Include(co => co.Batch)
                    .ThenInclude(b => b.Department)
                .Include(co => co.SubjectCoordinator)
                    .ThenInclude(f => f.IdNavigation)
                .FirstOrDefaultAsync(co => co.Id == id && co.DeletedAt == null);
        }

        public async Task<(List<CourseOffering> CourseOfferings, int TotalCount)> GetAllAsync(CourseOfferingFilterRequest filter)
        {
            var query = _context.CourseOfferings
                .Include(co => co.Subject)
                .Include(co => co.Batch)
                .Include(co => co.SubjectCoordinator)
                    .ThenInclude(f => f.IdNavigation)
                .Where(co => co.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(co =>
                    co.Subject.Code.ToLower().Contains(searchTerm) ||
                    co.Subject.Name.ToLower().Contains(searchTerm) ||
                    co.Batch.Name.ToLower().Contains(searchTerm));
            }

            if (filter.SubjectId.HasValue)
            {
                query = query.Where(co => co.SubjectId == filter.SubjectId.Value);
            }

            if (filter.BatchId.HasValue)
            {
                query = query.Where(co => co.BatchId == filter.BatchId.Value);
            }

            if (filter.DepartmentId.HasValue)
            {
                query = query.Where(co =>
                    co.Subject.DepartmentId == filter.DepartmentId.Value ||
                    co.Batch.DepartmentId == filter.DepartmentId.Value);
            }

            if (filter.SubjectCoordinatorId.HasValue)
            {
                query = query.Where(co => co.SubjectCoordinatorId == filter.SubjectCoordinatorId.Value);
            }

            if (filter.AcademicYear.HasValue)
            {
                query = query.Where(co => co.AcademicYear == filter.AcademicYear.Value);
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(co => co.IsActive == filter.IsActive.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(co => EF.Property<object>(co, filter.SortBy))
                : query.OrderBy(co => EF.Property<object>(co, filter.SortBy));

            // Apply pagination
            var courseOfferings = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (courseOfferings, totalCount);
        }

        public async Task<CourseOffering> CreateAsync(CourseOffering courseOffering)
        {
            courseOffering.CreatedAt = DateTime.Now;
            _context.CourseOfferings.Add(courseOffering);
            await _context.SaveChangesAsync();
            return courseOffering;
        }

        public async Task<CourseOffering> UpdateAsync(CourseOffering courseOffering)
        {
            courseOffering.UpdatedAt = DateTime.Now;
            _context.CourseOfferings.Update(courseOffering);
            await _context.SaveChangesAsync();
            return courseOffering;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var courseOffering = await _context.CourseOfferings.FindAsync(id);
            if (courseOffering == null) return false;

            // Soft delete
            courseOffering.DeletedAt = DateTime.Now;
            courseOffering.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.CourseOfferings.AnyAsync(co => co.Id == id && co.DeletedAt == null);
        }

        public async Task<int> GetCourseEnrollmentsCountAsync(int courseOfferingId)
        {
            return await _context.CourseEnrollments
                .Where(ce => ce.CourseOfferingId == courseOfferingId && ce.DeletedAt == null)
                .CountAsync();
        }

        public async Task<int> GetActiveEnrollmentsCountAsync(int courseOfferingId)
        {
            return await _context.CourseEnrollments
                .Where(ce => ce.CourseOfferingId == courseOfferingId &&
                            ce.Status == "Active" &&
                            ce.DeletedAt == null)
                .CountAsync();
        }

        public async Task<int> GetEvaluationSchemesCountAsync(int courseOfferingId)
        {
            return await _context.EvaluationSchemes
                .Where(es => es.CourseOfferingId == courseOfferingId && es.DeletedAt == null)
                .CountAsync();
        }

        public async Task<int> GetFacultyAssignmentsCountAsync(int courseOfferingId)
        {
            return await _context.FacultyAssignments
                .Where(fa => fa.CourseOfferingId == courseOfferingId && fa.DeletedAt == null)
                .CountAsync();
        }
    }
}