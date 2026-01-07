using GradeSense.API.DTOs.CourseOffering.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface ICourseOfferingRepository
    {
        Task<CourseOffering?> GetByIdAsync(int id);
        Task<(List<CourseOffering> CourseOfferings, int TotalCount)> GetAllAsync(CourseOfferingFilterRequest filter);
        Task<CourseOffering> CreateAsync(CourseOffering courseOffering);
        Task<CourseOffering> UpdateAsync(CourseOffering courseOffering);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<int> GetCourseEnrollmentsCountAsync(int courseOfferingId);
        Task<int> GetActiveEnrollmentsCountAsync(int courseOfferingId);
        Task<int> GetEvaluationSchemesCountAsync(int courseOfferingId);
        Task<int> GetFacultyAssignmentsCountAsync(int courseOfferingId);
    }
}