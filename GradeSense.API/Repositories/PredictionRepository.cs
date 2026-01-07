using GradeSense.API.Data;
using GradeSense.API.DTOs.Prediction.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class PredictionRepository : IPredictionRepository
    {
        private readonly GradeSenseDbContext _context;

        public PredictionRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<Prediction?> GetByIdAsync(string id)
        {
            return await _context.Predictions
                .Include(p => p.CourseEnrollment)
                    .ThenInclude(ce => ce.Student)
                        .ThenInclude(s => s.IdNavigation)
                .Include(p => p.CourseEnrollment)
                    .ThenInclude(ce => ce.CourseOffering)
                        .ThenInclude(co => co.Subject)
                            .ThenInclude(s => s.Department)
                .Include(p => p.CourseEnrollment)
                    .ThenInclude(ce => ce.CourseOffering)
                        .ThenInclude(co => co.Batch)
                .Include(p => p.ReviewedByNavigation)
                    .ThenInclude(f => f.IdNavigation)
                .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null);
        }

        public async Task<(List<Prediction> Predictions, int TotalCount)> GetAllAsync(PredictionFilterRequest filter)
        {
            var query = _context.Predictions
                .Include(p => p.CourseEnrollment)
                    .ThenInclude(ce => ce.Student)
                        .ThenInclude(s => s.IdNavigation)
                .Include(p => p.CourseEnrollment)
                    .ThenInclude(ce => ce.CourseOffering)
                        .ThenInclude(co => co.Subject)
                .Include(p => p.CourseEnrollment)
                    .ThenInclude(ce => ce.CourseOffering)
                        .ThenInclude(co => co.Batch)
                .Include(p => p.ReviewedByNavigation)
                    .ThenInclude(f => f.IdNavigation)
                .Where(p => p.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(p =>
                    p.CourseEnrollment.Student.IdNavigation.FullName.ToLower().Contains(searchTerm) ||
                    p.CourseEnrollment.Student.EnrollmentNumber.ToLower().Contains(searchTerm) ||
                    p.CourseEnrollment.CourseOffering.Subject.Code.ToLower().Contains(searchTerm) ||
                    p.CourseEnrollment.CourseOffering.Subject.Name.ToLower().Contains(searchTerm));
            }

            if (filter.CourseEnrollmentId.HasValue)
            {
                query = query.Where(p => p.CourseEnrollmentId == filter.CourseEnrollmentId.Value);
            }

            if (filter.StudentId.HasValue)
            {
                query = query.Where(p => p.CourseEnrollment.StudentId == filter.StudentId.Value);
            }

            if (filter.CourseOfferingId.HasValue)
            {
                query = query.Where(p => p.CourseEnrollment.CourseOfferingId == filter.CourseOfferingId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.PredictedCategory))
            {
                query = query.Where(p => p.PredictedCategory == filter.PredictedCategory);
            }

            if (filter.IsActive.HasValue)
            {
                query = query.Where(p => p.IsActive == filter.IsActive.Value);
            }

            if (filter.IsExpired.HasValue)
            {
                var now = DateTime.Now;
                if (filter.IsExpired.Value)
                {
                    query = query.Where(p => p.ExpiresAt.HasValue && p.ExpiresAt.Value < now);
                }
                else
                {
                    query = query.Where(p => !p.ExpiresAt.HasValue || p.ExpiresAt.Value >= now);
                }
            }

            if (filter.IsReviewed.HasValue)
            {
                if (filter.IsReviewed.Value)
                {
                    query = query.Where(p => p.ReviewedBy.HasValue);
                }
                else
                {
                    query = query.Where(p => !p.ReviewedBy.HasValue);
                }
            }

            if (filter.ReviewedBy.HasValue)
            {
                query = query.Where(p => p.ReviewedBy == filter.ReviewedBy.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(p => EF.Property<object>(p, filter.SortBy))
                : query.OrderBy(p => EF.Property<object>(p, filter.SortBy));

            // Apply pagination
            var predictions = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (predictions, totalCount);
        }

        public async Task<Prediction> CreateAsync(Prediction prediction)
        {
            prediction.CreatedAt = DateTime.Now;
            _context.Predictions.Add(prediction);
            await _context.SaveChangesAsync();
            return prediction;
        }

        public async Task<Prediction> UpdateAsync(Prediction prediction)
        {
            prediction.UpdatedAt = DateTime.Now;
            _context.Predictions.Update(prediction);
            await _context.SaveChangesAsync();
            return prediction;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var prediction = await _context.Predictions.FindAsync(id);
            if (prediction == null) return false;

            // Soft delete
            prediction.DeletedAt = DateTime.Now;
            prediction.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await _context.Predictions.AnyAsync(p => p.Id == id && p.DeletedAt == null);
        }
    }
}