using GradeSense.API.Data;
using GradeSense.API.DTOs.AttendanceRecord.Request;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GradeSense.API.Repositories
{
    public class AttendanceRecordRepository : IAttendanceRecordRepository
    {
        private readonly GradeSenseDbContext _context;

        public AttendanceRecordRepository(GradeSenseDbContext context)
        {
            _context = context;
        }

        public async Task<AttendanceRecord?> GetByIdAsync(int id)
        {
            return await _context.AttendanceRecords
                .Include(ar => ar.Enrollment)
                    .ThenInclude(e => e.Student)
                        .ThenInclude(s => s.IdNavigation)
                .Include(ar => ar.Enrollment)
                    .ThenInclude(e => e.CourseOffering)
                        .ThenInclude(co => co.Subject)
                            .ThenInclude(s => s.Department)
                .Include(ar => ar.Enrollment)
                    .ThenInclude(e => e.CourseOffering)
                        .ThenInclude(co => co.Batch)
                .Include(ar => ar.RecordedByNavigation)
                    .ThenInclude(f => f.IdNavigation)
                .FirstOrDefaultAsync(ar => ar.Id == id && ar.DeletedAt == null);
        }

        public async Task<(List<AttendanceRecord> AttendanceRecords, int TotalCount)> GetAllAsync(AttendanceRecordFilterRequest filter)
        {
            var query = _context.AttendanceRecords
                .Include(ar => ar.Enrollment)
                    .ThenInclude(e => e.Student)
                        .ThenInclude(s => s.IdNavigation)
                .Include(ar => ar.Enrollment)
                    .ThenInclude(e => e.CourseOffering)
                        .ThenInclude(co => co.Subject)
                .Include(ar => ar.Enrollment)
                    .ThenInclude(e => e.CourseOffering)
                        .ThenInclude(co => co.Batch)
                .Include(ar => ar.RecordedByNavigation)
                    .ThenInclude(f => f.IdNavigation)
                .Where(ar => ar.DeletedAt == null)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(ar =>
                    ar.Enrollment.Student.IdNavigation.FullName.ToLower().Contains(searchTerm) ||
                    ar.Enrollment.Student.EnrollmentNumber.ToLower().Contains(searchTerm) ||
                    ar.Enrollment.CourseOffering.Subject.Code.ToLower().Contains(searchTerm) ||
                    ar.Enrollment.CourseOffering.Subject.Name.ToLower().Contains(searchTerm));
            }

            if (filter.EnrollmentId.HasValue)
            {
                query = query.Where(ar => ar.EnrollmentId == filter.EnrollmentId.Value);
            }

            if (filter.StudentId.HasValue)
            {
                query = query.Where(ar => ar.Enrollment.StudentId == filter.StudentId.Value);
            }

            if (filter.CourseOfferingId.HasValue)
            {
                query = query.Where(ar => ar.Enrollment.CourseOfferingId == filter.CourseOfferingId.Value);
            }

            if (filter.SubjectId.HasValue)
            {
                query = query.Where(ar => ar.Enrollment.CourseOffering.SubjectId == filter.SubjectId.Value);
            }

            if (filter.BatchId.HasValue)
            {
                query = query.Where(ar => ar.Enrollment.CourseOffering.BatchId == filter.BatchId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filter.Status))
            {
                query = query.Where(ar => ar.Status == filter.Status);
            }

            if (filter.FromDate.HasValue)
            {
                query = query.Where(ar => ar.AttendanceDate >= filter.FromDate.Value);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(ar => ar.AttendanceDate <= filter.ToDate.Value);
            }

            if (filter.RecordedBy.HasValue)
            {
                query = query.Where(ar => ar.RecordedBy == filter.RecordedBy.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply sorting
            query = filter.SortOrder.ToLower() == "desc"
                ? query.OrderByDescending(ar => EF.Property<object>(ar, filter.SortBy))
                : query.OrderBy(ar => EF.Property<object>(ar, filter.SortBy));

            // Apply pagination
            var attendanceRecords = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (attendanceRecords, totalCount);
        }

        public async Task<AttendanceRecord> CreateAsync(AttendanceRecord attendanceRecord)
        {
            attendanceRecord.CreatedAt = DateTime.Now;
            _context.AttendanceRecords.Add(attendanceRecord);
            await _context.SaveChangesAsync();
            return attendanceRecord;
        }

        public async Task<AttendanceRecord> UpdateAsync(AttendanceRecord attendanceRecord)
        {
            attendanceRecord.UpdatedAt = DateTime.Now;
            _context.AttendanceRecords.Update(attendanceRecord);
            await _context.SaveChangesAsync();
            return attendanceRecord;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var attendanceRecord = await _context.AttendanceRecords.FindAsync(id);
            if (attendanceRecord == null) return false;

            // Soft delete
            attendanceRecord.DeletedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> DeleteByEnrollmentIdAsync(int enrollmentId)
        {
            var records = await _context.AttendanceRecords
                .Where(ar => ar.EnrollmentId == enrollmentId && ar.DeletedAt == null)
                .ToListAsync();

            foreach (var ar in records)
            {
                ar.DeletedAt = DateTime.Now;
            }

            await _context.SaveChangesAsync();
            return records.Count;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.AttendanceRecords.AnyAsync(ar => ar.Id == id && ar.DeletedAt == null);
        }

        public async Task<bool> AttendanceExistsForDateAsync(int enrollmentId, DateOnly attendanceDate, int? excludeId = null)
        {
            var query = _context.AttendanceRecords.Where(ar =>
                ar.EnrollmentId == enrollmentId &&
                ar.AttendanceDate == attendanceDate &&
                ar.DeletedAt == null);

            if (excludeId.HasValue)
            {
                query = query.Where(ar => ar.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<AttendanceRecord?> FindByEnrollmentAndDateAsync(int enrollmentId, DateOnly attendanceDate)
        {
            return await _context.AttendanceRecords
                .FirstOrDefaultAsync(ar =>
                    ar.EnrollmentId == enrollmentId &&
                    ar.AttendanceDate == attendanceDate &&
                    ar.DeletedAt == null);
        }
    }
}