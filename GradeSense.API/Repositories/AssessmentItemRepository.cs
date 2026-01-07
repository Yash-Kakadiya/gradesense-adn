using GradeSense.API.Data;
using GradeSense.API.DTOs.AssessmentItem.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class AssessmentItemRepository : IAssessmentItemRepository
    {
        private readonly GradeSenseDbContext _context;

        public AssessmentItemRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<AssessmentItem?> GetByIdAsync(int id)
        {
            return await _context.AssessmentItems
                .Include(ai => ai.EvaluationScheme)
                    .ThenInclude(es => es.CourseOffering)
                        .ThenInclude(co => co.Subject)
                .Include(ai => ai.EvaluationScheme)
                    .ThenInclude(es => es.CourseOffering)
                        .ThenInclude(co => co.Batch)
                .Include(ai => ai.SubjectUnit)
                .Include(ai => ai.CreatedByNavigation)
                    .ThenInclude(f => f.IdNavigation)
                .FirstOrDefaultAsync(ai => ai.Id == id && ai.DeletedAt == null);
        }

        public async Task<(List<AssessmentItem> AssessmentItems, int TotalCount)> GetAllAsync(AssessmentItemFilterRequest filter)
        {
            var query = _context.AssessmentItems
                .Include(ai => ai.EvaluationScheme)
                    .ThenInclude(es => es.CourseOffering)
                        .ThenInclude(co => co.Subject)
                .Include(ai => ai.EvaluationScheme)
                    .ThenInclude(es => es.CourseOffering)
                        .ThenInclude(co => co.Batch)
                .Include(ai => ai.SubjectUnit)
                .Include(ai => ai.CreatedByNavigation)
                    .ThenInclude(f => f.IdNavigation)
                .Where(ai => ai.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(ai =>
                    ai.Name.ToLower().Contains(searchTerm) ||
                    (ai.Description != null && ai.Description.ToLower().Contains(searchTerm)) ||
                    ai.EvaluationScheme.Name.ToLower().Contains(searchTerm));
            }

            if (filter.EvaluationSchemeId.HasValue)
            {
                query = query.Where(ai => ai.EvaluationSchemeId == filter.EvaluationSchemeId.Value);
            }

            if (filter.CourseOfferingId.HasValue)
            {
                query = query.Where(ai => ai.EvaluationScheme.CourseOfferingId == filter.CourseOfferingId.Value);
            }

            if (filter.SubjectId.HasValue)
            {
                query = query.Where(ai => ai.EvaluationScheme.CourseOffering.SubjectId == filter.SubjectId.Value);
            }

            if (filter.SubjectUnitId.HasValue)
            {
                query = query.Where(ai => ai.SubjectUnitId == filter.SubjectUnitId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.CalculationType))
            {
                query = query.Where(ai => ai.CalculationType == filter.CalculationType);
            }

            if (filter.CreatedBy.HasValue)
            {
                query = query.Where(ai => ai.CreatedBy == filter.CreatedBy.Value);
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(ai => ai.IsActive == filter.IsActive.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(ai => EF.Property<object>(ai, filter.SortBy))
                : query.OrderBy(ai => EF.Property<object>(ai, filter.SortBy));

            // Apply pagination
            var assessmentItems = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (assessmentItems, totalCount);
        }

        public async Task<AssessmentItem> CreateAsync(AssessmentItem assessmentItem)
        {
            assessmentItem.CreatedAt = DateTime.Now;
            _context.AssessmentItems.Add(assessmentItem);
            await _context.SaveChangesAsync();
            return assessmentItem;
        }

        public async Task<AssessmentItem> UpdateAsync(AssessmentItem assessmentItem)
        {
            assessmentItem.UpdatedAt = DateTime.Now;
            _context.AssessmentItems.Update(assessmentItem);
            await _context.SaveChangesAsync();
            return assessmentItem;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var assessmentItem = await _context.AssessmentItems.FindAsync(id);
            if (assessmentItem == null) return false;

            // Soft delete
            assessmentItem.DeletedAt = DateTime.Now;
            assessmentItem.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.AssessmentItems.AnyAsync(ai => ai.Id == id && ai.DeletedAt == null);
        }

        public async Task<int> GetStudentMarksCountAsync(int assessmentItemId)
        {
            return await _context.StudentMarks
                .Where(sm => sm.AssessmentItemId == assessmentItemId && sm.DeletedAt == null)
                .CountAsync();
        }

        public async Task<int> GetUploadHistoriesCountAsync(int assessmentItemId)
        {
            return await _context.UploadHistories
                .Where(uh => uh.AssessmentItemId == assessmentItemId && uh.DeletedAt == null)
                .CountAsync();
        }
    }
}