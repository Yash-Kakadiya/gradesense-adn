using GradeSense.API.DTOs.AttendanceRecord.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface IAttendanceRecordRepository
    {
        Task<AttendanceRecord?> GetByIdAsync(int id);
        Task<(List<AttendanceRecord> AttendanceRecords, int TotalCount)> GetAllAsync(AttendanceRecordFilterRequest filter);
        Task<AttendanceRecord> CreateAsync(AttendanceRecord attendanceRecord);
        Task<AttendanceRecord> UpdateAsync(AttendanceRecord attendanceRecord);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> AttendanceExistsForDateAsync(int enrollmentId, DateOnly attendanceDate, int? excludeId = null);
    }
}