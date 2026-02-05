using GradeSense.API.DTOs.StudentMark.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface IStudentMarkRepository
    {
        Task<StudentMark?> GetByIdAsync(int id);
        Task<(List<StudentMark> StudentMarks, int TotalCount)> GetAllAsync(StudentMarkFilterRequest filter);
        Task<List<StudentMark>> GetByAssessmentItemIdAsync(int assessmentItemId);
        Task<List<StudentMark>> GetByCourseOfferingIdAsync(int courseOfferingId);
        Task<StudentMark> CreateAsync(StudentMark studentMark);
        Task<StudentMark> UpdateAsync(StudentMark studentMark);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> MarkExistsForEnrollmentAndAssessmentAsync(int enrollmentId, int assessmentItemId, int? excludeId = null);
    }
}