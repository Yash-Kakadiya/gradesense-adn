using GradeSense.API.Data;
using GradeSense.API.DTOs.EvaluationScheme.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class EvaluationSchemeRepository : IEvaluationSchemeRepository
    {
        private readonly GradeSenseDbContext _context;

        public EvaluationSchemeRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<EvaluationScheme?> GetByIdAsync(int id)
        {
            return await _context.EvaluationSchemes
                .Include(es => es.CourseOffering)
                    .ThenInclude(co => co.Subject)
                        .ThenInclude(s => s.Department)
                .Include(es => es.CourseOffering)
                    .ThenInclude(co => co.Batch)
                .FirstOrDefaultAsync(es => es.Id == id && es.DeletedAt == null);
        }

        public async Task<(List<EvaluationScheme> EvaluationSchemes, int TotalCount)> GetAllAsync(EvaluationSchemeFilterRequest filter)
        {
            var query = _context.EvaluationSchemes
                .Include(es => es.CourseOffering)
                    .ThenInclude(co => co.Subject)
                .Include(es => es.CourseOffering)
                    .ThenInclude(co => co.Batch)
                .Where(es => es.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(es =>
                    es.Name.ToLower().Contains(searchTerm) ||
                    (es.Description != null && es.Description.ToLower().Contains(searchTerm)) ||
                    es.CourseOffering.Subject.Code.ToLower().Contains(searchTerm) ||
                    es.CourseOffering.Subject.Name.ToLower().Contains(searchTerm));
            }

            if (filter.CourseOfferingId.HasValue)
            {
                query = query.Where(es => es.CourseOfferingId == filter.CourseOfferingId.Value);
            }

            if (filter.SubjectId.HasValue)
            {
                query = query.Where(es => es.CourseOffering.SubjectId == filter.SubjectId.Value);
            }

            if (filter.BatchId.HasValue)
            {
                query = query.Where(es => es.CourseOffering.BatchId == filter.BatchId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.EvaluationType))
            {
                query = query.Where(es => es.EvaluationType == filter.EvaluationType);
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(es => es.IsActive == filter.IsActive.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(es => EF.Property<object>(es, filter.SortBy))
                : query.OrderBy(es => EF.Property<object>(es, filter.SortBy));

            // Apply pagination
            var evaluationSchemes = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (evaluationSchemes, totalCount);
        }

        public async Task<EvaluationScheme> CreateAsync(EvaluationScheme evaluationScheme)
        {
            evaluationScheme.CreatedAt = DateTime.Now;
            _context.EvaluationSchemes.Add(evaluationScheme);
            await _context.SaveChangesAsync();
            return evaluationScheme;
        }

        public async Task<EvaluationScheme> UpdateAsync(EvaluationScheme evaluationScheme)
        {
            evaluationScheme.UpdatedAt = DateTime.Now;
            _context.EvaluationSchemes.Update(evaluationScheme);
            await _context.SaveChangesAsync();
            return evaluationScheme;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var evaluationScheme = await _context.EvaluationSchemes.FindAsync(id);
            if (evaluationScheme == null) return false;

            // Soft delete
            evaluationScheme.DeletedAt = DateTime.Now;
            evaluationScheme.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.EvaluationSchemes.AnyAsync(es => es.Id == id && es.DeletedAt == null);
        }

        public async Task<int> GetAssessmentItemsCountAsync(int evaluationSchemeId)
        {
            return await _context.AssessmentItems
                .Where(ai => ai.EvaluationSchemeId == evaluationSchemeId && ai.DeletedAt == null)
                .CountAsync();
        }

        public async Task<decimal> GetTotalWeightForCourseOfferingAsync(int courseOfferingId, int? excludeId = null)
        {
            var query = _context.EvaluationSchemes
                .Where(es => es.CourseOfferingId == courseOfferingId && es.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(es => es.Id != excludeId.Value);
            }

            return await query.SumAsync(es => es.Weight);
        }
    }
}