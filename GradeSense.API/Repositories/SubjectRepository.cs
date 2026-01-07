using GradeSense.API.Data;
using GradeSense.API.DTOs.Subject.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class SubjectRepository : ISubjectRepository
    {
        private readonly GradeSenseDbContext _context;

        public SubjectRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<Subject?> GetByIdAsync(int id)
        {
            return await _context.Subjects
                .Include(s => s.Department)
                .Include(s => s.PrerequisiteSubject)
                .FirstOrDefaultAsync(s => s.Id == id && s.DeletedAt == null);
        }

        public async Task<Subject?> GetByCodeAsync(string code)
        {
            return await _context.Subjects
                .Include(s => s.Department)
                .Include(s => s.PrerequisiteSubject)
                .FirstOrDefaultAsync(s => s.Code == code && s.DeletedAt == null);
        }

        public async Task<(List<Subject> Subjects, int TotalCount)> GetAllAsync(SubjectFilterRequest filter)
        {
            var query = _context.Subjects
                .Include(s => s.Department)
                .Include(s => s.PrerequisiteSubject)
                .Where(s => s.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(s =>
                    s.Code.ToLower().Contains(searchTerm) ||
                    s.Name.ToLower().Contains(searchTerm) ||
                    (s.Description != null && s.Description.ToLower().Contains(searchTerm)));
            }

            if (filter.DepartmentId.HasValue)
            {
                query = query.Where(s => s.DepartmentId == filter.DepartmentId.Value);
            }

            if (filter.Semester.HasValue)
            {
                query = query.Where(s => s.Semester == filter.Semester.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.SubjectType))
            {
                query = query.Where(s => s.SubjectType == filter.SubjectType);
            }

            if (filter.IsElective.HasValue)
            {
                query = query.Where(s => s.IsElective == filter.IsElective.Value);
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(s => s.IsActive == filter.IsActive.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(s => EF.Property<object>(s, filter.SortBy))
                : query.OrderBy(s => EF.Property<object>(s, filter.SortBy));

            // Apply pagination
            var subjects = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (subjects, totalCount);
        }

        public async Task<Subject> CreateAsync(Subject subject)
        {
            subject.CreatedAt = DateTime.Now;
            _context.Subjects.Add(subject);
            await _context.SaveChangesAsync();
            return subject;
        }

        public async Task<Subject> UpdateAsync(Subject subject)
        {
            subject.UpdatedAt = DateTime.Now;
            _context.Subjects.Update(subject);
            await _context.SaveChangesAsync();
            return subject;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var subject = await _context.Subjects.FindAsync(id);
            if (subject == null) return false;

            // Soft delete
            subject.DeletedAt = DateTime.Now;
            subject.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Subjects.AnyAsync(s => s.Id == id && s.DeletedAt == null);
        }

        public async Task<bool> CodeExistsAsync(string code, int? excludeId = null)
        {
            var query = _context.Subjects.Where(s => s.Code == code && s.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(s => s.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<int> GetSubjectUnitsCountAsync(int subjectId)
        {
            return await _context.SubjectUnits
                .Where(su => su.SubjectId == subjectId && su.DeletedAt == null)
                .CountAsync();
        }

        public async Task<int> GetCourseOfferingsCountAsync(int subjectId)
        {
            return await _context.CourseOfferings
                .Where(co => co.SubjectId == subjectId && co.DeletedAt == null)
                .CountAsync();
        }

        public async Task<int> GetDependentSubjectsCountAsync(int subjectId)
        {
            return await _context.Subjects
                .Where(s => s.PrerequisiteSubjectId == subjectId && s.DeletedAt == null)
                .CountAsync();
        }
    }
}