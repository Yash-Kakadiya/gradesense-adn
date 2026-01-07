using GradeSense.API.Data;
using GradeSense.API.DTOs.SubjectUnit.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class SubjectUnitRepository : ISubjectUnitRepository
    {
        private readonly GradeSenseDbContext _context;

        public SubjectUnitRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<SubjectUnit?> GetByIdAsync(int id)
        {
            return await _context.SubjectUnits
                .Include(su => su.Subject)
                .FirstOrDefaultAsync(su => su.Id == id && su.DeletedAt == null);
        }

        public async Task<(List<SubjectUnit> SubjectUnits, int TotalCount)> GetAllAsync(SubjectUnitFilterRequest filter)
        {
            var query = _context.SubjectUnits
                .Include(su => su.Subject)
                .Where(su => su.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(su =>
                    su.TopicName.ToLower().Contains(searchTerm) ||
                    (su.Description != null && su.Description.ToLower().Contains(searchTerm)) ||
                    (su.LearningOutcomes != null && su.LearningOutcomes.ToLower().Contains(searchTerm)));
            }

            if (filter.SubjectId.HasValue)
            {
                query = query.Where(su => su.SubjectId == filter.SubjectId.Value);
            }

            if (filter.UnitNumber.HasValue)
            {
                query = query.Where(su => su.UnitNumber == filter.UnitNumber.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(su => EF.Property<object>(su, filter.SortBy))
                : query.OrderBy(su => EF.Property<object>(su, filter.SortBy));

            // Apply pagination
            var subjectUnits = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (subjectUnits, totalCount);
        }

        public async Task<SubjectUnit> CreateAsync(SubjectUnit subjectUnit)
        {
            subjectUnit.CreatedAt = DateTime.Now;
            _context.SubjectUnits.Add(subjectUnit);
            await _context.SaveChangesAsync();
            return subjectUnit;
        }

        public async Task<SubjectUnit> UpdateAsync(SubjectUnit subjectUnit)
        {
            subjectUnit.UpdatedAt = DateTime.Now;
            _context.SubjectUnits.Update(subjectUnit);
            await _context.SaveChangesAsync();
            return subjectUnit;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var subjectUnit = await _context.SubjectUnits.FindAsync(id);
            if (subjectUnit == null) return false;

            // Soft delete
            subjectUnit.DeletedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.SubjectUnits.AnyAsync(su => su.Id == id && su.DeletedAt == null);
        }

        public async Task<bool> UnitNumberExistsForSubjectAsync(int subjectId, int unitNumber, int? excludeId = null)
        {
            var query = _context.SubjectUnits.Where(su =>
                su.SubjectId == subjectId &&
                su.UnitNumber == unitNumber &&
                su.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(su => su.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<int> GetAssessmentItemsCountAsync(int subjectUnitId)
        {
            return await _context.AssessmentItems
                .Where(ai => ai.SubjectUnitId == subjectUnitId && ai.DeletedAt == null)
                .CountAsync();
        }
    }
}