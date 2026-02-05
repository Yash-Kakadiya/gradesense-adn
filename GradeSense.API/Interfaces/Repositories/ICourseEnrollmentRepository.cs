using GradeSense.API.DTOs.CourseEnrollment.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface ICourseEnrollmentRepository
    {
        Task<CourseEnrollment?> GetByIdAsync(int id);
        Task<(List<CourseEnrollment> CourseEnrollments, int TotalCount)> GetAllAsync(CourseEnrollmentFilterRequest filter);
        Task<List<CourseEnrollment>> GetByCourseOfferingIdAsync(int courseOfferingId);
        Task<CourseEnrollment?> GetByStudentEnrollmentNumberAndCourseOfferingAsync(string enrollmentNumber, int courseOfferingId);
        Task<CourseEnrollment> CreateAsync(CourseEnrollment courseEnrollment);
        Task<CourseEnrollment> UpdateAsync(CourseEnrollment courseEnrollment);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> RollNumberExistsForCourseAsync(int courseOfferingId, string rollNumber, int? excludeId = null);
        Task<bool> StudentAlreadyEnrolledAsync(int courseOfferingId, int studentId, int? excludeId = null);
        Task<int> GetStudentMarksCountAsync(int enrollmentId);
        Task<int> GetAttendanceRecordsCountAsync(int enrollmentId);
        Task<int> GetPredictionsCountAsync(int enrollmentId);
    }
}