using GradeSense.API.DTOs.FacultyAssignment.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface IFacultyAssignmentRepository
    {
        Task<FacultyAssignment?> GetByIdAsync(int id);
        Task<(List<FacultyAssignment> FacultyAssignments, int TotalCount)> GetAllAsync(FacultyAssignmentFilterRequest filter);
        Task<FacultyAssignment> CreateAsync(FacultyAssignment facultyAssignment);
        Task<FacultyAssignment> UpdateAsync(FacultyAssignment facultyAssignment);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> FacultyAlreadyAssignedAsync(int courseOfferingId, int facultyId, int? excludeId = null);
    }
}