using GradeSense.API.DTOs.AttendanceRecord.Request;
using GradeSense.API.DTOs.AttendanceRecord.Response;
using GradeSense.API.DTOs.Common;

namespace GradeSense.API.Interfaces.Services
{
    public interface IAttendanceRecordService
    {
        Task<PagedResponse<AttendanceRecordListResponse>> GetAllAsync(AttendanceRecordFilterRequest filter);
        Task<AttendanceRecordDetailResponse?> GetByIdAsync(int id);
        Task<AttendanceRecordResponse> CreateAsync(CreateAttendanceRecordRequest request);
        Task<AttendanceRecordResponse> UpdateAsync(int id, UpdateAttendanceRecordRequest request);
        Task<bool> DeleteAsync(int id);
        Task<BulkAttendanceResponse> BulkMarkAsync(BulkAttendanceRequest request);
    }
}