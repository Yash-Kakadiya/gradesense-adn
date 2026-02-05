using GradeSense.API.Data;
using GradeSense.API.DTOs.Faculty.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class FacultyRepository : IFacultyRepository
    {
        private readonly GradeSenseDbContext _context;

        public FacultyRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<Faculty?> GetByIdAsync(int id)
        {
            return await _context.Faculties
                .Include(f => f.IdNavigation)
                .Include(f => f.Department)
                .FirstOrDefaultAsync(f => f.Id == id && f.DeletedAt == null);
        }

        public async Task<Faculty?> GetByEmployeeIdAsync(string employeeId)
        {
            return await _context.Faculties
                .Include(f => f.IdNavigation)
                .Include(f => f.Department)
                .FirstOrDefaultAsync(f => f.EmployeeId == employeeId && f.DeletedAt == null);
        }

        public async Task<Faculty?> GetByUserIdAsync(int userId)
        {
            return await _context.Faculties
                .Include(f => f.IdNavigation)
                .Include(f => f.Department)
                .FirstOrDefaultAsync(f => f.Id == userId && f.DeletedAt == null);
        }

        public async Task<(List<Faculty> Faculties, int TotalCount)> GetAllAsync(FacultyFilterRequest filter)
        {
            var query = _context.Faculties
                .Include(f => f.IdNavigation)
                .Include(f => f.Department)
                .Where(f => f.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(f =>
                    f.EmployeeId.ToLower().Contains(searchTerm) ||
                    f.IdNavigation.FullName.ToLower().Contains(searchTerm) ||
                    f.IdNavigation.PersonalEmail.ToLower().Contains(searchTerm) ||
                    (f.IdNavigation.InstitutionalEmail != null && f.IdNavigation.InstitutionalEmail.ToLower().Contains(searchTerm)) ||
                    (f.IdNavigation.PhoneNumber != null && f.IdNavigation.PhoneNumber.Contains(searchTerm)) ||
                    (f.Designation != null && f.Designation.ToLower().Contains(searchTerm)));
            }

            if (filter.DepartmentId.HasValue)
            {
                query = query.Where(f => f.DepartmentId == filter.DepartmentId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Designation))
            {
                query = query.Where(f => f.Designation == filter.Designation);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(f => EF.Property<object>(f, filter.SortBy))
                : query.OrderBy(f => EF.Property<object>(f, filter.SortBy));

            // Apply pagination
            var faculties = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (faculties, totalCount);
        }

        public async Task<Faculty> CreateAsync(Faculty faculty)
        {
            faculty.CreatedAt = DateTime.Now;
            _context.Faculties.Add(faculty);
            await _context.SaveChangesAsync();
            return faculty;
        }

        public async Task<Faculty> UpdateAsync(Faculty faculty)
        {
            faculty.UpdatedAt = DateTime.Now;
            _context.Faculties.Update(faculty);
            await _context.SaveChangesAsync();
            return faculty;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var faculty = await _context.Faculties.FindAsync(id);
            if (faculty == null) return false;

            // Soft delete
            faculty.DeletedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Faculties.AnyAsync(f => f.Id == id && f.DeletedAt == null);
        }

        public async Task<bool> EmployeeIdExistsAsync(string employeeId, int? excludeId = null)
        {
            var query = _context.Faculties.Where(f => f.EmployeeId == employeeId && f.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(f => f.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<bool> UserIdExistsAsync(int userId)
        {
            return await _context.Faculties.AnyAsync(f => f.Id == userId && f.DeletedAt == null);
        }

        public async Task<int> GetAssignedCoursesCountAsync(int facultyId)
        {
            return await _context.FacultyAssignments
                .Where(fa => fa.FacultyId == facultyId)
                .CountAsync();
        }

        public async Task<int> GetCoordinatingBatchesCountAsync(int facultyId)
        {
            return await _context.Batches
                .Where(b => b.ClassCoordinatorId == facultyId && b.DeletedAt == null)
                .CountAsync();
        }

        public async Task<int> GetCoordinatingCoursesCountAsync(int facultyId)
        {
            return await _context.CourseOfferings
                .Where(co => co.SubjectCoordinatorId == facultyId && co.DeletedAt == null)
                .CountAsync();
        }
    }
}