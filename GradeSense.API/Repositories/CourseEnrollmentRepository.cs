using GradeSense.API.Data;
using GradeSense.API.DTOs.CourseEnrollment.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class CourseEnrollmentRepository : ICourseEnrollmentRepository
    {
        private readonly GradeSenseDbContext _context;

        public CourseEnrollmentRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<CourseEnrollment?> GetByIdAsync(int id)
        {
            return await _context.CourseEnrollments
                .Include(ce => ce.CourseOffering)
                    .ThenInclude(co => co.Subject)
                        .ThenInclude(s => s.Department)
                .Include(ce => ce.CourseOffering)
                    .ThenInclude(co => co.Batch)
                .Include(ce => ce.Student)
                    .ThenInclude(s => s.IdNavigation)
                .FirstOrDefaultAsync(ce => ce.Id == id && ce.DeletedAt == null);
        }

        public async Task<(List<CourseEnrollment> CourseEnrollments, int TotalCount)> GetAllAsync(CourseEnrollmentFilterRequest filter)
        {
            var query = _context.CourseEnrollments
                .Include(ce => ce.CourseOffering)
                    .ThenInclude(co => co.Subject)
                .Include(ce => ce.CourseOffering)
                    .ThenInclude(co => co.Batch)
                .Include(ce => ce.CourseOffering)
                    .ThenInclude(co => co.SubjectCoordinator)
                        .ThenInclude(f => f.IdNavigation)
                .Include(ce => ce.Student)
                    .ThenInclude(s => s.IdNavigation)
                .Where(ce => ce.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(ce =>
                    ce.Student.IdNavigation.FullName.ToLower().Contains(searchTerm) ||
                    ce.Student.EnrollmentNumber.ToLower().Contains(searchTerm) ||
                    (ce.RollNumber != null && ce.RollNumber.ToLower().Contains(searchTerm)) ||
                    ce.CourseOffering.Subject.Code.ToLower().Contains(searchTerm) ||
                    ce.CourseOffering.Subject.Name.ToLower().Contains(searchTerm));
            }

            if (filter.CourseOfferingId.HasValue)
            {
                query = query.Where(ce => ce.CourseOfferingId == filter.CourseOfferingId.Value);
            }

            if (filter.StudentId.HasValue)
            {
                query = query.Where(ce => ce.StudentId == filter.StudentId.Value);
            }

            if (filter.SubjectId.HasValue)
            {
                query = query.Where(ce => ce.CourseOffering.SubjectId == filter.SubjectId.Value);
            }

            if (filter.BatchId.HasValue)
            {
                query = query.Where(ce => ce.CourseOffering.BatchId == filter.BatchId.Value);
            }

            if (filter.DepartmentId.HasValue)
            {
                query = query.Where(ce => ce.Student.DepartmentId == filter.DepartmentId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Status))
            {
                query = query.Where(ce => ce.Status == filter.Status);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(ce => EF.Property<object>(ce, filter.SortBy))
                : query.OrderBy(ce => EF.Property<object>(ce, filter.SortBy));

            // Apply pagination
            var courseEnrollments = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (courseEnrollments, totalCount);
        }

        public async Task<CourseEnrollment> CreateAsync(CourseEnrollment courseEnrollment)
        {
            courseEnrollment.CreatedAt = DateTime.Now;
            _context.CourseEnrollments.Add(courseEnrollment);
            await _context.SaveChangesAsync();
            return courseEnrollment;
        }

        public async Task<CourseEnrollment> UpdateAsync(CourseEnrollment courseEnrollment)
        {
            courseEnrollment.UpdatedAt = DateTime.Now;
            _context.CourseEnrollments.Update(courseEnrollment);
            await _context.SaveChangesAsync();
            return courseEnrollment;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var courseEnrollment = await _context.CourseEnrollments.FindAsync(id);
            if (courseEnrollment == null) return false;

            // Soft delete
            courseEnrollment.DeletedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.CourseEnrollments.AnyAsync(ce => ce.Id == id && ce.DeletedAt == null);
        }

        public async Task<bool> RollNumberExistsForCourseAsync(int courseOfferingId, string rollNumber, int? excludeId = null)
        {
            var query = _context.CourseEnrollments.Where(ce =>
                ce.CourseOfferingId == courseOfferingId &&
                ce.RollNumber == rollNumber &&
                ce.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(ce => ce.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<bool> StudentAlreadyEnrolledAsync(int courseOfferingId, int studentId, int? excludeId = null)
        {
            var query = _context.CourseEnrollments.Where(ce =>
                ce.CourseOfferingId == courseOfferingId &&
                ce.StudentId == studentId &&
                ce.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(ce => ce.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<int> GetStudentMarksCountAsync(int enrollmentId)
        {
            return await _context.StudentMarks
                .Where(sm => sm.EnrollmentId == enrollmentId && sm.DeletedAt == null)
                .CountAsync();
        }

        public async Task<int> GetAttendanceRecordsCountAsync(int enrollmentId)
        {
            return await _context.AttendanceRecords
                .Where(ar => ar.EnrollmentId == enrollmentId && ar.DeletedAt == null)
                .CountAsync();
        }

        public async Task<int> GetPredictionsCountAsync(int enrollmentId)
        {
            return await _context.Predictions
                .Where(p => p.CourseEnrollmentId == enrollmentId && p.DeletedAt == null)
                .CountAsync();
        }

        public async Task<List<CourseEnrollment>> GetByCourseOfferingIdAsync(int courseOfferingId)
        {
            return await _context.CourseEnrollments
                .Include(ce => ce.Student)
                    .ThenInclude(s => s.IdNavigation)
                .Include(ce => ce.CourseOffering)
                    .ThenInclude(co => co.Subject)
                .Where(ce => ce.CourseOfferingId == courseOfferingId && 
                            ce.DeletedAt == null && 
                            ce.Status == "Active")
                .OrderBy(ce => ce.Student.EnrollmentNumber)
                .ToListAsync();
        }

        public async Task<CourseEnrollment?> GetByStudentEnrollmentNumberAndCourseOfferingAsync(
            string enrollmentNumber, int courseOfferingId)
        {
            return await _context.CourseEnrollments
                .Include(ce => ce.Student)
                    .ThenInclude(s => s.IdNavigation)
                .Include(ce => ce.CourseOffering)
                    .ThenInclude(co => co.Subject)
                .FirstOrDefaultAsync(ce => 
                    ce.Student.EnrollmentNumber == enrollmentNumber && 
                    ce.CourseOfferingId == courseOfferingId && 
                    ce.DeletedAt == null);
        }
    }
}