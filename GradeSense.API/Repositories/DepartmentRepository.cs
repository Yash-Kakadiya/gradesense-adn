using GradeSense.API.Data;
using GradeSense.API.DTOs.Department.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class DepartmentRepository : IDepartmentRepository
    {
        private readonly GradeSenseDbContext _context;

        public DepartmentRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<Department?> GetByIdAsync(int id)
        {
            return await _context.Departments
                .Include(d => d.Hoduser)
                .FirstOrDefaultAsync(d => d.Id == id && d.DeletedAt == null);
        }

        public async Task<Department?> GetByNameAsync(string name)
        {
            return await _context.Departments
                .FirstOrDefaultAsync(d => d.Name == name && d.DeletedAt == null);
        }

        public async Task<Department?> GetByCodeAsync(string code)
        {
            return await _context.Departments
                .FirstOrDefaultAsync(d => d.Code == code && d.DeletedAt == null);
        }

        public async Task<(List<Department> Departments, int TotalCount)> GetAllAsync(DepartmentFilterRequest filter)
        {
            var query = _context.Departments
                .Include(d => d.Hoduser)
                .Where(d => d.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(d =>
                    d.Name.ToLower().Contains(searchTerm) ||
                    (d.Code != null && d.Code.ToLower().Contains(searchTerm)));
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(d => d.IsActive == filter.IsActive.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(d => EF.Property<object>(d, filter.SortBy))
                : query.OrderBy(d => EF.Property<object>(d, filter.SortBy));

            // Apply pagination
            var departments = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (departments, totalCount);
        }

        public async Task<Department> CreateAsync(Department department)
        {
            department.CreatedAt = DateTime.Now;
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();
            return department;
        }

        public async Task<Department> UpdateAsync(Department department)
        {
            department.UpdatedAt = DateTime.Now;
            _context.Departments.Update(department);
            await _context.SaveChangesAsync();
            return department;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department == null) return false;

            // Soft delete
            department.DeletedAt = DateTime.Now;
            department.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Departments.AnyAsync(d => d.Id == id && d.DeletedAt == null);
        }

        public async Task<bool> NameExistsAsync(string name, int? excludeId = null)
        {
            var query = _context.Departments.Where(d => d.Name == name && d.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(d => d.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<bool> CodeExistsAsync(string code, int? excludeId = null)
        {
            var query = _context.Departments.Where(d => d.Code == code && d.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(d => d.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<int> GetFacultyCountAsync(int departmentId)
        {
            return await _context.Faculties
                .Where(f => f.DepartmentId == departmentId && f.DeletedAt == null)
                .CountAsync();
        }

        public async Task<int> GetStudentCountAsync(int departmentId)
        {
            return await _context.Students
                .Where(s => s.DepartmentId == departmentId && s.DeletedAt == null)
                .CountAsync();
        }

        public async Task<int> GetSubjectCountAsync(int departmentId)
        {
            return await _context.Subjects
                .Where(s => s.DepartmentId == departmentId && s.DeletedAt == null)
                .CountAsync();
        }

        public async Task<int> GetBatchCountAsync(int departmentId)
        {
            return await _context.Batches
                .Where(b => b.DepartmentId == departmentId && b.DeletedAt == null)
                .CountAsync();
        }

        public async Task<List<Department>> GetAllForLookupAsync()
        {
            return await _context.Departments
                .Where(d => d.DeletedAt == null && d.IsActive)
                .ToListAsync();
        }
    }
}
