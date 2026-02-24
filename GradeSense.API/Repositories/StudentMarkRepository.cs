using GradeSense.API.Data;
using GradeSense.API.DTOs.StudentMark.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class StudentMarkRepository : IStudentMarkRepository
    {
        private readonly GradeSenseDbContext _context;

        public StudentMarkRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<StudentMark?> GetByIdAsync(int id)
        {
            return await _context.StudentMarks
                .Include(sm => sm.Enrollment)
                    .ThenInclude(e => e.Student)
                        .ThenInclude(s => s.IdNavigation)
                .Include(sm => sm.Enrollment)
                    .ThenInclude(e => e.CourseOffering)
                        .ThenInclude(co => co.Subject)
                .Include(sm => sm.Enrollment)
                    .ThenInclude(e => e.CourseOffering)
                        .ThenInclude(co => co.Batch)
                .Include(sm => sm.AssessmentItem)
                    .ThenInclude(ai => ai.EvaluationScheme)
                .Include(sm => sm.Grader)
                    .ThenInclude(g => g.IdNavigation)
                .FirstOrDefaultAsync(sm => sm.Id == id && sm.DeletedAt == null);
        }

        public async Task<(List<StudentMark> StudentMarks, int TotalCount)> GetAllAsync(StudentMarkFilterRequest filter)
        {
            var query = _context.StudentMarks
                .Include(sm => sm.Enrollment)
                    .ThenInclude(e => e.Student)
                        .ThenInclude(s => s.IdNavigation)
                .Include(sm => sm.Enrollment)
                    .ThenInclude(e => e.CourseOffering)
                .Include(sm => sm.AssessmentItem)
                    .ThenInclude(ai => ai.EvaluationScheme)
                .Include(sm => sm.Grader)
                    .ThenInclude(g => g.IdNavigation)
                .Where(sm => sm.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(sm =>
                    sm.Enrollment.Student.IdNavigation.FullName.ToLower().Contains(searchTerm) ||
                    sm.Enrollment.Student.EnrollmentNumber.ToLower().Contains(searchTerm) ||
                    sm.AssessmentItem.Name.ToLower().Contains(searchTerm));
            }

            if (filter.EnrollmentId.HasValue)
            {
                query = query.Where(sm => sm.EnrollmentId == filter.EnrollmentId.Value);
            }

            if (filter.StudentId.HasValue)
            {
                query = query.Where(sm => sm.Enrollment.StudentId == filter.StudentId.Value);
            }

            if (filter.AssessmentItemId.HasValue)
            {
                query = query.Where(sm => sm.AssessmentItemId == filter.AssessmentItemId.Value);
            }

            if (filter.EvaluationSchemeId.HasValue)
            {
                query = query.Where(sm => sm.AssessmentItem.EvaluationSchemeId == filter.EvaluationSchemeId.Value);
            }

            if (filter.CourseOfferingId.HasValue)
            {
                query = query.Where(sm => sm.Enrollment.CourseOfferingId == filter.CourseOfferingId.Value);
            }

            if (filter.SubjectId.HasValue)
            {
                query = query.Where(sm => sm.Enrollment.CourseOffering.SubjectId == filter.SubjectId.Value);
            }

            if (filter.GraderId.HasValue)
            {
                query = query.Where(sm => sm.GraderId == filter.GraderId.Value);
            }

            if (filter.IsAbsent.HasValue)
            {
                query = query.Where(sm => sm.IsAbsent == filter.IsAbsent.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(sm => EF.Property<object>(sm, filter.SortBy))
                : query.OrderBy(sm => EF.Property<object>(sm, filter.SortBy));

            // Apply pagination
            var studentMarks = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (studentMarks, totalCount);
        }

        public async Task<StudentMark> CreateAsync(StudentMark studentMark)
        {
            studentMark.CreatedAt = DateTime.Now;
            _context.StudentMarks.Add(studentMark);
            await _context.SaveChangesAsync();
            return studentMark;
        }

        public async Task<StudentMark> UpdateAsync(StudentMark studentMark)
        {
            studentMark.UpdatedAt = DateTime.Now;
            _context.StudentMarks.Update(studentMark);
            await _context.SaveChangesAsync();
            return studentMark;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var studentMark = await _context.StudentMarks.FindAsync(id);
            if (studentMark == null) return false;

            // Soft delete
            studentMark.DeletedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> DeleteByEnrollmentIdAsync(int enrollmentId)
        {
            var studentMarks = await _context.StudentMarks
                .Where(sm => sm.EnrollmentId == enrollmentId && sm.DeletedAt == null)
                .ToListAsync();

            foreach (var sm in studentMarks)
            {
                sm.DeletedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return studentMarks.Count;
        }

        public async Task<int> DeleteByAssessmentItemIdAsync(int assessmentItemId)
        {
            var studentMarks = await _context.StudentMarks
                .Where(sm => sm.AssessmentItemId == assessmentItemId && sm.DeletedAt == null)
                .ToListAsync();

            foreach (var sm in studentMarks)
            {
                sm.DeletedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return studentMarks.Count;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.StudentMarks.AnyAsync(sm => sm.Id == id && sm.DeletedAt == null);
        }

        public async Task<bool> MarkExistsForEnrollmentAndAssessmentAsync(int enrollmentId, int assessmentItemId, int? excludeId = null)
        {
            var query = _context.StudentMarks.Where(sm =>
                sm.EnrollmentId == enrollmentId &&
                sm.AssessmentItemId == assessmentItemId &&
                sm.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(sm => sm.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<List<StudentMark>> GetByAssessmentItemIdAsync(int assessmentItemId)
        {
            return await _context.StudentMarks
                .Include(sm => sm.Enrollment)
                    .ThenInclude(e => e.Student)
                        .ThenInclude(s => s.IdNavigation)
                .Include(sm => sm.Enrollment)
                    .ThenInclude(e => e.CourseOffering)
                        .ThenInclude(co => co.Subject)
                .Include(sm => sm.AssessmentItem)
                .Include(sm => sm.Grader)
                    .ThenInclude(g => g.IdNavigation)
                .Where(sm => sm.AssessmentItemId == assessmentItemId && sm.DeletedAt == null)
                .OrderBy(sm => sm.Enrollment.Student.EnrollmentNumber)
                .ToListAsync();
        }

        public async Task<List<StudentMark>> GetByCourseOfferingIdAsync(int courseOfferingId)
        {
            return await _context.StudentMarks
                .Include(sm => sm.Enrollment)
                    .ThenInclude(e => e.Student)
                        .ThenInclude(s => s.IdNavigation)
                .Include(sm => sm.Enrollment)
                    .ThenInclude(e => e.CourseOffering)
                        .ThenInclude(co => co.Subject)
                .Include(sm => sm.AssessmentItem)
                .Include(sm => sm.Grader)
                    .ThenInclude(g => g.IdNavigation)
                .Where(sm => sm.Enrollment.CourseOfferingId == courseOfferingId && sm.DeletedAt == null)
                .OrderBy(sm => sm.Enrollment.Student.EnrollmentNumber)
                .ThenBy(sm => sm.AssessmentItem.Name)
                .ToListAsync();
        }

        public async Task<StudentMark?> FindByStudentAndAssessmentAsync(int studentId, int assessmentItemId)
        {
            return await _context.StudentMarks
                .Include(sm => sm.Enrollment)
                .FirstOrDefaultAsync(sm => 
                    sm.Enrollment.StudentId == studentId && 
                    sm.AssessmentItemId == assessmentItemId && 
                    sm.DeletedAt == null);
        }
    }
}