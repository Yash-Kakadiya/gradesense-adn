using GradeSense.API.DTOs.Subject.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface ISubjectRepository
    {
        Task<Subject?> GetByIdAsync(int id);
        Task<Subject?> GetByCodeAsync(string code);
        Task<(List<Subject> Subjects, int TotalCount)> GetAllAsync(SubjectFilterRequest filter);
        Task<Subject> CreateAsync(Subject subject);
        Task<Subject> UpdateAsync(Subject subject);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> CodeExistsAsync(string code, int? excludeId = null);
        Task<int> GetSubjectUnitsCountAsync(int subjectId);
        Task<int> GetCourseOfferingsCountAsync(int subjectId);
        Task<int> GetDependentSubjectsCountAsync(int subjectId);
    }
}