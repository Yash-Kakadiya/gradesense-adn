using GradeSense.API.DTOs.Student.Request;
using GradeSense.API.Models;

namespace GradeSense.API.Interfaces.Repositories
{
    public interface IStudentRepository
    {
        Task<Student?> GetByIdAsync(int id);
        Task<Student?> GetByEnrollmentNumberAsync(string enrollmentNumber);
        Task<Student?> GetByUserIdAsync(int userId);
        Task<(List<Student> Students, int TotalCount)> GetAllAsync(StudentFilterRequest filter);
        Task<List<Student>> GetAllStudentsForLookupAsync();
        Task<Student> CreateAsync(Student student);
        Task<Student> UpdateAsync(Student student);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<bool> EnrollmentNumberExistsAsync(string enrollmentNumber, int? excludeId = null);
        Task<bool> UserIdExistsAsync(int userId);
        Task<int> GetEnrolledCoursesCountAsync(int studentId);
        Task<int> GetCompletedCoursesCountAsync(int studentId);
        Task<int> GetActiveCoursesCountAsync(int studentId);
    }
}