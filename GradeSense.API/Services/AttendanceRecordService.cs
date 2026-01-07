using GradeSense.API.DTOs.AttendanceRecord.Request;
using GradeSense.API.DTOs.AttendanceRecord.Response;
using GradeSense.API.DTOs.Common;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class AttendanceRecordService : IAttendanceRecordService
    {
        private readonly IAttendanceRecordRepository _attendanceRecordRepository;
        private readonly ICourseEnrollmentRepository _courseEnrollmentRepository;
        private readonly IFacultyRepository _facultyRepository;
        private readonly ILogger<AttendanceRecordService> _logger;

        public AttendanceRecordService(
            IAttendanceRecordRepository attendanceRecordRepository,
            ICourseEnrollmentRepository courseEnrollmentRepository,
            IFacultyRepository facultyRepository,
            ILogger<AttendanceRecordService> logger)
        {
            _attendanceRecordRepository = attendanceRecordRepository;
            _courseEnrollmentRepository = courseEnrollmentRepository;
            _facultyRepository = facultyRepository;
            _logger = logger;
        }

        public async Task<PagedResponse<AttendanceRecordListResponse>> GetAllAsync(AttendanceRecordFilterRequest filter)
        {
            var (attendanceRecords, total) = await _attendanceRecordRepository.GetAllAsync(filter);

            var data = attendanceRecords.Select(ar => new AttendanceRecordListResponse
            {
                Id = ar.Id,
                StudentName = ar.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = ar.Enrollment.Student.EnrollmentNumber,
                SubjectCode = ar.Enrollment.CourseOffering.Subject.Code,
                AttendanceDate = ar.AttendanceDate,
                Status = ar.Status,
                RecordedByName = ar.RecordedByNavigation?.IdNavigation.FullName,
                CreatedAt = ar.CreatedAt
            }).ToList();

            return new PagedResponse<AttendanceRecordListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<AttendanceRecordDetailResponse?> GetByIdAsync(int id)
        {
            var attendanceRecord = await _attendanceRecordRepository.GetByIdAsync(id);
            if (attendanceRecord == null) return null;

            return new AttendanceRecordDetailResponse
            {
                Id = attendanceRecord.Id,
                EnrollmentId = attendanceRecord.EnrollmentId,
                StudentName = attendanceRecord.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = attendanceRecord.Enrollment.Student.EnrollmentNumber,
                StudentEmail = attendanceRecord.Enrollment.Student.IdNavigation.Email,
                StudentId = attendanceRecord.Enrollment.StudentId,
                CourseOfferingId = attendanceRecord.Enrollment.CourseOfferingId,
                SubjectCode = attendanceRecord.Enrollment.CourseOffering.Subject.Code,
                SubjectName = attendanceRecord.Enrollment.CourseOffering.Subject.Name,
                BatchName = attendanceRecord.Enrollment.CourseOffering.Batch.Name,
                DepartmentName = attendanceRecord.Enrollment.CourseOffering.Subject.Department.Name,
                AttendanceDate = attendanceRecord.AttendanceDate,
                Status = attendanceRecord.Status,
                RecordedBy = attendanceRecord.RecordedBy,
                RecordedByName = attendanceRecord.RecordedByNavigation?.IdNavigation.FullName,
                RecordedByEmployeeId = attendanceRecord.RecordedByNavigation?.EmployeeId,
                Remarks = attendanceRecord.Remarks,
                CreatedAt = attendanceRecord.CreatedAt,
                UpdatedAt = attendanceRecord.UpdatedAt,
                DeletedAt = attendanceRecord.DeletedAt
            };
        }

        public async Task<AttendanceRecordResponse> CreateAsync(CreateAttendanceRecordRequest request)
        {
            // Validate Enrollment exists
            var enrollment = await _courseEnrollmentRepository.GetByIdAsync(request.EnrollmentId);
            if (enrollment == null)
                throw new KeyNotFoundException("Course enrollment not found");

            if (enrollment.Status != "Active")
            {
                _logger.LogWarning(
                    "Attendance record created for non-active enrollment {EnrollmentId} with status {Status}",
                    request.EnrollmentId, enrollment.Status);
            }

            // Validate RecordedBy exists if provided
            if (request.RecordedBy.HasValue &&
                !await _facultyRepository.ExistsAsync(request.RecordedBy.Value))
            {
                throw new KeyNotFoundException("Faculty (RecordedBy) not found");
            }

            // Check for duplicate attendance
            if (await _attendanceRecordRepository.AttendanceExistsForDateAsync(request.EnrollmentId, request.AttendanceDate))
            {
                throw new InvalidOperationException(
                    $"Attendance record already exists for this enrollment on {request.AttendanceDate:yyyy-MM-dd}");
            }

            // Soft validation: Check if attendance date is within course offering dates
            if (enrollment.CourseOffering.StartDate.HasValue &&
                request.AttendanceDate < enrollment.CourseOffering.StartDate.Value)
            {
                _logger.LogWarning(
                    "Attendance date {AttendanceDate} is before course start date {StartDate}",
                    request.AttendanceDate, enrollment.CourseOffering.StartDate);
            }

            if (enrollment.CourseOffering.EndDate.HasValue &&
                request.AttendanceDate > enrollment.CourseOffering.EndDate.Value)
            {
                _logger.LogWarning(
                    "Attendance date {AttendanceDate} is after course end date {EndDate}",
                    request.AttendanceDate, enrollment.CourseOffering.EndDate);
            }

            var attendanceRecord = new AttendanceRecord
            {
                EnrollmentId = request.EnrollmentId,
                AttendanceDate = request.AttendanceDate,
                Status = request.Status,
                RecordedBy = request.RecordedBy,
                Remarks = request.Remarks
            };

            await _attendanceRecordRepository.CreateAsync(attendanceRecord);

            // Reload with navigation properties
            attendanceRecord = await _attendanceRecordRepository.GetByIdAsync(attendanceRecord.Id);

            return new AttendanceRecordResponse
            {
                Id = attendanceRecord!.Id,
                EnrollmentId = attendanceRecord.EnrollmentId,
                StudentName = attendanceRecord.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = attendanceRecord.Enrollment.Student.EnrollmentNumber,
                SubjectCode = attendanceRecord.Enrollment.CourseOffering.Subject.Code,
                SubjectName = attendanceRecord.Enrollment.CourseOffering.Subject.Name,
                AttendanceDate = attendanceRecord.AttendanceDate,
                Status = attendanceRecord.Status,
                RecordedBy = attendanceRecord.RecordedBy,
                RecordedByName = attendanceRecord.RecordedByNavigation?.IdNavigation.FullName,
                Remarks = attendanceRecord.Remarks,
                CreatedAt = attendanceRecord.CreatedAt,
                UpdatedAt = attendanceRecord.UpdatedAt
            };
        }

        public async Task<AttendanceRecordResponse> UpdateAsync(int id, UpdateAttendanceRecordRequest request)
        {
            var attendanceRecord = await _attendanceRecordRepository.GetByIdAsync(id);
            if (attendanceRecord == null)
                throw new KeyNotFoundException("Attendance record not found");

            // Validate RecordedBy exists if being changed
            if (request.RecordedBy.HasValue &&
                !await _facultyRepository.ExistsAsync(request.RecordedBy.Value))
            {
                throw new KeyNotFoundException("Faculty (RecordedBy) not found");
            }

            // Check for duplicate attendance if date is being changed
            if (request.AttendanceDate.HasValue &&
                request.AttendanceDate.Value != attendanceRecord.AttendanceDate &&
                await _attendanceRecordRepository.AttendanceExistsForDateAsync(
                    attendanceRecord.EnrollmentId, request.AttendanceDate.Value, id))
            {
                throw new InvalidOperationException(
                    $"Attendance record already exists for this enrollment on {request.AttendanceDate.Value:yyyy-MM-dd}");
            }

            // Update fields if provided
            if (request.AttendanceDate.HasValue)
                attendanceRecord.AttendanceDate = request.AttendanceDate.Value;

            if (!string.IsNullOrEmpty(request.Status))
                attendanceRecord.Status = request.Status;

            if (request.RecordedBy != null)
                attendanceRecord.RecordedBy = request.RecordedBy;

            attendanceRecord.Remarks = request.Remarks ?? attendanceRecord.Remarks;

            await _attendanceRecordRepository.UpdateAsync(attendanceRecord);

            // Reload with navigation properties
            attendanceRecord = await _attendanceRecordRepository.GetByIdAsync(id);

            return new AttendanceRecordResponse
            {
                Id = attendanceRecord!.Id,
                EnrollmentId = attendanceRecord.EnrollmentId,
                StudentName = attendanceRecord.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = attendanceRecord.Enrollment.Student.EnrollmentNumber,
                SubjectCode = attendanceRecord.Enrollment.CourseOffering.Subject.Code,
                SubjectName = attendanceRecord.Enrollment.CourseOffering.Subject.Name,
                AttendanceDate = attendanceRecord.AttendanceDate,
                Status = attendanceRecord.Status,
                RecordedBy = attendanceRecord.RecordedBy,
                RecordedByName = attendanceRecord.RecordedByNavigation?.IdNavigation.FullName,
                Remarks = attendanceRecord.Remarks,
                CreatedAt = attendanceRecord.CreatedAt,
                UpdatedAt = attendanceRecord.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _attendanceRecordRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Attendance record not found");

            // Optional: Prevent deletion of old records
            var attendanceRecord = await _attendanceRecordRepository.GetByIdAsync(id);
            if (attendanceRecord != null)
            {
                var daysSinceRecord = (DateTime.Now.Date - attendanceRecord.AttendanceDate.ToDateTime(TimeOnly.MinValue)).Days;
                if (daysSinceRecord > 30)
                {
                    _logger.LogWarning(
                        "Attempting to delete attendance record {AttendanceRecordId} that is {Days} days old",
                        id, daysSinceRecord);
                }
            }

            return await _attendanceRecordRepository.DeleteAsync(id);
        }
    }
}