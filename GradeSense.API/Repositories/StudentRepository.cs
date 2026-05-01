using GradeSense.API.Data;
using GradeSense.API.DTOs.Student.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class StudentRepository : IStudentRepository
    {
        private readonly GradeSenseDbContext _context;

        public StudentRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<Student?> GetByIdAsync(int id)
        {
            return await _context.Students
                .Include(s => s.IdNavigation)
                .Include(s => s.Department)
                .FirstOrDefaultAsync(s => s.Id == id && s.DeletedAt == null);
        }

        public async Task<Student?> GetByEnrollmentNumberAsync(string enrollmentNumber)
        {
            return await _context.Students
                .Include(s => s.IdNavigation)
                .Include(s => s.Department)
                .FirstOrDefaultAsync(s => s.EnrollmentNumber == enrollmentNumber && s.DeletedAt == null);
        }

        public async Task<Student?> GetByUserIdAsync(int userId)
        {
            return await _context.Students
                .Include(s => s.IdNavigation)
                .Include(s => s.Department)
                .FirstOrDefaultAsync(s => s.Id == userId && s.DeletedAt == null);
        }

        public async Task<(List<Student> Students, int TotalCount)> GetAllAsync(StudentFilterRequest filter)
        {
            var query = _context.Students
                .Include(s => s.IdNavigation)
                .Include(s => s.Department)
                .Where(s => s.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(s =>
                    s.EnrollmentNumber.ToLower().Contains(searchTerm) ||
                    s.IdNavigation.FullName.ToLower().Contains(searchTerm) ||
                    s.IdNavigation.PersonalEmail.ToLower().Contains(searchTerm) ||
                    (s.IdNavigation.InstitutionalEmail != null && s.IdNavigation.InstitutionalEmail.ToLower().Contains(searchTerm)) ||
                    (s.IdNavigation.PhoneNumber != null && s.IdNavigation.PhoneNumber.Contains(searchTerm)));
            }

            if (filter.DepartmentId.HasValue)
            {
                query = query.Where(s => s.DepartmentId == filter.DepartmentId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Status))
            {
                query = query.Where(s => s.Status == filter.Status);
            }

            if (filter.AdmissionYear.HasValue)
            {
                query = query.Where(s => s.AdmissionYear == filter.AdmissionYear.Value);
            }

            if (filter.CurrentSemester.HasValue)
            {
                query = query.Where(s => s.CurrentSemester == filter.CurrentSemester.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(s => EF.Property<object>(s, filter.SortBy))
                : query.OrderBy(s => EF.Property<object>(s, filter.SortBy));

            // Apply pagination
            var students = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (students, totalCount);
        }

        public async Task<List<Student>> GetAllStudentsForLookupAsync()
        {
            return await _context.Students
                .Include(s => s.IdNavigation)
                .Include(s => s.Department)
                .Where(s => s.DeletedAt == null && s.Status == "Active")
                .ToListAsync();
        }

        public async Task<Student> CreateAsync(Student student)
        {
            student.CreatedAt = DateTime.Now;
            _context.Students.Add(student);
            await _context.SaveChangesAsync();
            return student;
        }

        public async Task<Student> UpdateAsync(Student student)
        {
            student.UpdatedAt = DateTime.Now;
            _context.Students.Update(student);
            await _context.SaveChangesAsync();
            return student;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student == null) return false;

            // Soft delete
            student.DeletedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Students.AnyAsync(s => s.Id == id && s.DeletedAt == null);
        }

        public async Task<bool> EnrollmentNumberExistsAsync(string enrollmentNumber, int? excludeId = null)
        {
            var query = _context.Students.Where(s => s.EnrollmentNumber == enrollmentNumber && s.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(s => s.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<bool> UserIdExistsAsync(int userId)
        {
            return await _context.Students.AnyAsync(s => s.Id == userId && s.DeletedAt == null);
        }

        public async Task<int> GetEnrolledCoursesCountAsync(int studentId)
        {
            return await _context.CourseEnrollments
                .Where(ce => ce.StudentId == studentId)
                .CountAsync();
        }

        public async Task<int> GetCompletedCoursesCountAsync(int studentId)
        {
            return await _context.CourseEnrollments
                .Where(ce => ce.StudentId == studentId && ce.Status == "Completed")
                .CountAsync();
        }

        public async Task<int> GetActiveCoursesCountAsync(int studentId)
        {
            return await _context.CourseEnrollments
                .Where(ce => ce.StudentId == studentId && ce.Status == "Active")
                .CountAsync();
        }
    }
}