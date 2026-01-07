using GradeSense.API.DTOs.SubjectUnit.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface ISubjectUnitRepository
    {
        Task<SubjectUnit?> GetByIdAsync(int id);
        Task<(List<SubjectUnit> SubjectUnits, int TotalCount)> GetAllAsync(SubjectUnitFilterRequest filter);
        Task<SubjectUnit> CreateAsync(SubjectUnit subjectUnit);
        Task<SubjectUnit> UpdateAsync(SubjectUnit subjectUnit);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> UnitNumberExistsForSubjectAsync(int subjectId, int unitNumber, int? excludeId = null);
        Task<int> GetAssessmentItemsCountAsync(int subjectUnitId);
    }
}