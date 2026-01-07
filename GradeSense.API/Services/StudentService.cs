using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Student.Request;
using GradeSense.API.DTOs.Student.Response;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class StudentService : IStudentService
    {
        private readonly IStudentRepository _studentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IDepartmentRepository _departmentRepository;

        public StudentService(
            IStudentRepository studentRepository,
            IUserRepository userRepository,
            IDepartmentRepository departmentRepository)
        {
            _studentRepository = studentRepository;
            _userRepository = userRepository;
            _departmentRepository = departmentRepository;
        }

        public async Task<PagedResponse<StudentListResponse>> GetAllAsync(StudentFilterRequest filter)
        {
            var (students, total) = await _studentRepository.GetAllAsync(filter);

            var data = students.Select(s => new StudentListResponse
            {
                Id = s.Id,
                EnrollmentNumber = s.EnrollmentNumber,
                FullName = s.IdNavigation.FullName,
                Email = s.IdNavigation.Email,
                DepartmentName = s.Department.Name,
                CurrentSemester = s.CurrentSemester,
                Status = s.Status,
                CGPA = s.Cgpa,
                CreatedAt = s.CreatedAt
            }).ToList();

            return new PagedResponse<StudentListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<StudentDetailResponse?> GetByIdAsync(int id)
        {
            var student = await _studentRepository.GetByIdAsync(id);
            if (student == null) return null;

            return new StudentDetailResponse
            {
                Id = student.Id,
                EnrollmentNumber = student.EnrollmentNumber,
                AdmissionYear = student.AdmissionYear,
                CurrentSemester = student.CurrentSemester,
                DepartmentId = student.DepartmentId,
                DepartmentName = student.Department.Name,
                DepartmentCode = student.Department.Code,
                Status = student.Status,
                CGPA = student.Cgpa,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt,
                DeletedAt = student.DeletedAt,
                FullName = student.IdNavigation.FullName,
                Email = student.IdNavigation.Email,
                IsActive = student.IdNavigation.IsActive,
                EnrolledCoursesCount = await _studentRepository.GetEnrolledCoursesCountAsync(id),
                CompletedCoursesCount = await _studentRepository.GetCompletedCoursesCountAsync(id),
                ActiveCoursesCount = await _studentRepository.GetActiveCoursesCountAsync(id)
            };
        }

        public async Task<StudentResponse> CreateAsync(CreateStudentRequest request)
        {
            // Validate User exists
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            // Validate User has Student role
            if (user.Role != "Student")
                throw new InvalidOperationException("User must have Student role");

            // Validate User is active
            if (!user.IsActive || user.DeletedAt != null)
                throw new InvalidOperationException("User is not active");

            // Validate User is not already linked to a Student
            if (await _studentRepository.UserIdExistsAsync(request.UserId))
                throw new InvalidOperationException("User is already linked to a Student record");

            // Validate EnrollmentNumber is unique
            if (await _studentRepository.EnrollmentNumberExistsAsync(request.EnrollmentNumber))
                throw new InvalidOperationException("Enrollment number already exists");

            // Validate Department exists
            if (!await _departmentRepository.ExistsAsync(request.DepartmentId))
                throw new KeyNotFoundException("Department not found");

            var student = new Student
            {
                Id = request.UserId, // Important: Use UserId as Id (1-to-1 relationship)
                EnrollmentNumber = request.EnrollmentNumber,
                AdmissionYear = request.AdmissionYear,
                CurrentSemester = request.CurrentSemester,
                DepartmentId = request.DepartmentId,
                Status = request.Status,
                Cgpa = request.CGPA
            };

            await _studentRepository.CreateAsync(student);

            // Reload with navigation properties
            student = await _studentRepository.GetByIdAsync(student.Id);

            return new StudentResponse
            {
                Id = student!.Id,
                EnrollmentNumber = student.EnrollmentNumber,
                AdmissionYear = student.AdmissionYear,
                CurrentSemester = student.CurrentSemester,
                DepartmentId = student.DepartmentId,
                DepartmentName = student.Department.Name,
                Status = student.Status,
                CGPA = student.Cgpa,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt,
                FullName = student.IdNavigation.FullName,
                Email = student.IdNavigation.Email
            };
        }

        public async Task<StudentResponse> UpdateAsync(int id, UpdateStudentRequest request)
        {
            var student = await _studentRepository.GetByIdAsync(id);
            if (student == null)
                throw new KeyNotFoundException("Student not found");

            // Validate EnrollmentNumber uniqueness if being changed
            if (!string.IsNullOrEmpty(request.EnrollmentNumber) &&
                request.EnrollmentNumber != student.EnrollmentNumber &&
                await _studentRepository.EnrollmentNumberExistsAsync(request.EnrollmentNumber, id))
            {
                throw new InvalidOperationException("Enrollment number already exists");
            }

            // Validate Department exists if being changed
            if (request.DepartmentId.HasValue &&
                !await _departmentRepository.ExistsAsync(request.DepartmentId.Value))
            {
                throw new KeyNotFoundException("Department not found");
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.EnrollmentNumber))
                student.EnrollmentNumber = request.EnrollmentNumber;

            if (request.AdmissionYear.HasValue)
                student.AdmissionYear = request.AdmissionYear.Value;

            if (request.CurrentSemester.HasValue)
                student.CurrentSemester = request.CurrentSemester.Value;

            if (request.DepartmentId.HasValue)
                student.DepartmentId = request.DepartmentId.Value;

            if (!string.IsNullOrEmpty(request.Status))
                student.Status = request.Status;

            if (request.CGPA.HasValue)
                student.Cgpa = request.CGPA.Value;

            await _studentRepository.UpdateAsync(student);

            // Reload with navigation properties
            student = await _studentRepository.GetByIdAsync(id);

            return new StudentResponse
            {
                Id = student!.Id,
                EnrollmentNumber = student.EnrollmentNumber,
                AdmissionYear = student.AdmissionYear,
                CurrentSemester = student.CurrentSemester,
                DepartmentId = student.DepartmentId,
                DepartmentName = student.Department.Name,
                Status = student.Status,
                CGPA = student.Cgpa,
                CreatedAt = student.CreatedAt,
                UpdatedAt = student.UpdatedAt,
                FullName = student.IdNavigation.FullName,
                Email = student.IdNavigation.Email
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _studentRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Student not found");

            // Check if student has any course enrollments
            var enrolledCourses = await _studentRepository.GetEnrolledCoursesCountAsync(id);
            if (enrolledCourses > 0)
                throw new InvalidOperationException($"Cannot delete student who has {enrolledCourses} course enrollment(s)");

            return await _studentRepository.DeleteAsync(id);
        }
    }
}