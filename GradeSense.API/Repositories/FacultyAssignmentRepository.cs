using GradeSense.API.Data;
using GradeSense.API.DTOs.FacultyAssignment.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class FacultyAssignmentRepository : IFacultyAssignmentRepository
    {
        private readonly GradeSenseDbContext _context;

        public FacultyAssignmentRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<FacultyAssignment?> GetByIdAsync(int id)
        {
            return await _context.FacultyAssignments
                .Include(fa => fa.CourseOffering)
                    .ThenInclude(co => co.Subject)
                        .ThenInclude(s => s.Department)
                .Include(fa => fa.CourseOffering)
                    .ThenInclude(co => co.Batch)
                .Include(fa => fa.Faculty)
                    .ThenInclude(f => f.IdNavigation)
                .FirstOrDefaultAsync(fa => fa.Id == id && fa.DeletedAt == null);
        }

        public async Task<(List<FacultyAssignment> FacultyAssignments, int TotalCount)> GetAllAsync(FacultyAssignmentFilterRequest filter)
        {
            var query = _context.FacultyAssignments
                .Include(fa => fa.CourseOffering)
                    .ThenInclude(co => co.Subject)
                .Include(fa => fa.CourseOffering)
                    .ThenInclude(co => co.Batch)
                .Include(fa => fa.Faculty)
                    .ThenInclude(f => f.IdNavigation)
                .Where(fa => fa.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(fa =>
                    fa.Faculty.IdNavigation.FullName.ToLower().Contains(searchTerm) ||
                    fa.Faculty.EmployeeId.ToLower().Contains(searchTerm) ||
                    fa.CourseOffering.Subject.Code.ToLower().Contains(searchTerm) ||
                    fa.CourseOffering.Subject.Name.ToLower().Contains(searchTerm) ||
                    (fa.Role != null && fa.Role.ToLower().Contains(searchTerm)));
            }

            if (filter.CourseOfferingId.HasValue)
            {
                query = query.Where(fa => fa.CourseOfferingId == filter.CourseOfferingId.Value);
            }

            if (filter.FacultyId.HasValue)
            {
                query = query.Where(fa => fa.FacultyId == filter.FacultyId.Value);
            }

            if (filter.SubjectId.HasValue)
            {
                query = query.Where(fa => fa.CourseOffering.SubjectId == filter.SubjectId.Value);
            }

            if (filter.BatchId.HasValue)
            {
                query = query.Where(fa => fa.CourseOffering.BatchId == filter.BatchId.Value);
            }

            if (filter.DepartmentId.HasValue)
            {
                query = query.Where(fa => fa.Faculty.DepartmentId == filter.DepartmentId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Role))
            {
                query = query.Where(fa => fa.Role == filter.Role);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(fa => EF.Property<object>(fa, filter.SortBy))
                : query.OrderBy(fa => EF.Property<object>(fa, filter.SortBy));

            // Apply pagination
            var facultyAssignments = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (facultyAssignments, totalCount);
        }

        public async Task<FacultyAssignment> CreateAsync(FacultyAssignment facultyAssignment)
        {
            facultyAssignment.CreatedAt = DateTime.Now;
            _context.FacultyAssignments.Add(facultyAssignment);
            await _context.SaveChangesAsync();
            return facultyAssignment;
        }

        public async Task<FacultyAssignment> UpdateAsync(FacultyAssignment facultyAssignment)
        {
            facultyAssignment.UpdatedAt = DateTime.Now;
            _context.FacultyAssignments.Update(facultyAssignment);
            await _context.SaveChangesAsync();
            return facultyAssignment;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var facultyAssignment = await _context.FacultyAssignments.FindAsync(id);
            if (facultyAssignment == null) return false;

            // Soft delete
            facultyAssignment.DeletedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.FacultyAssignments.AnyAsync(fa => fa.Id == id && fa.DeletedAt == null);
        }

        public async Task<bool> FacultyAlreadyAssignedAsync(int courseOfferingId, int facultyId, int? excludeId = null)
        {
            var query = _context.FacultyAssignments.Where(fa =>
                fa.CourseOfferingId == courseOfferingId &&
                fa.FacultyId == facultyId &&
                fa.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(fa => fa.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
    }
}