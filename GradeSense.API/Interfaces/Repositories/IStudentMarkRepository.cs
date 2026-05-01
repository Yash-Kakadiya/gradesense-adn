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
        Task<List<StudentMark>> GetByEnrollmentIdsAsync(IEnumerable<int> enrollmentIds);
        Task<StudentMark?> FindByStudentAndAssessmentAsync(int studentId, int assessmentItemId);
        Task<StudentMark?> GetByEnrollmentAndAssessmentAsync(int enrollmentId, int assessmentItemId);
        Task<StudentMark> CreateAsync(StudentMark studentMark);
        Task<StudentMark> UpdateAsync(StudentMark studentMark);
        Task<bool> DeleteAsync(int id);
        Task<int> DeleteByEnrollmentIdAsync(int enrollmentId);
        Task<int> DeleteByAssessmentItemIdAsync(int assessmentItemId);
        Task<bool> ExistsAsync(int id);
        Task<bool> MarkExistsForEnrollmentAndAssessmentAsync(int enrollmentId, int assessmentItemId, int? excludeId = null);
    }
}