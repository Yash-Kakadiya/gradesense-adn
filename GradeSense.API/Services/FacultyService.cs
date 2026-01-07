using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Faculty.Request;
using GradeSense.API.DTOs.Faculty.Response;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class FacultyService : IFacultyService
    {
        private readonly IFacultyRepository _facultyRepository;
        private readonly IUserRepository _userRepository;
        private readonly IDepartmentRepository _departmentRepository;

        public FacultyService(
            IFacultyRepository facultyRepository,
            IUserRepository userRepository,
            IDepartmentRepository departmentRepository)
        {
            _facultyRepository = facultyRepository;
            _userRepository = userRepository;
            _departmentRepository = departmentRepository;
        }

        public async Task<PagedResponse<FacultyListResponse>> GetAllAsync(FacultyFilterRequest filter)
        {
            var (faculties, total) = await _facultyRepository.GetAllAsync(filter);

            var data = faculties.Select(f => new FacultyListResponse
            {
                Id = f.Id,
                EmployeeId = f.EmployeeId,
                FullName = f.IdNavigation.FullName,
                Email = f.IdNavigation.Email,
                DepartmentName = f.Department.Name,
                Designation = f.Designation,
                CreatedAt = f.CreatedAt
            }).ToList();

            return new PagedResponse<FacultyListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<FacultyDetailResponse?> GetByIdAsync(int id)
        {
            var faculty = await _facultyRepository.GetByIdAsync(id);
            if (faculty == null) return null;

            return new FacultyDetailResponse
            {
                Id = faculty.Id,
                EmployeeId = faculty.EmployeeId,
                DepartmentId = faculty.DepartmentId,
                DepartmentName = faculty.Department.Name,
                DepartmentCode = faculty.Department.Code,
                Designation = faculty.Designation,
                JoiningDate = faculty.JoiningDate,
                Qualification = faculty.Qualification,
                Specialization = faculty.Specialization,
                CreatedAt = faculty.CreatedAt,
                UpdatedAt = faculty.UpdatedAt,
                DeletedAt = faculty.DeletedAt,
                FullName = faculty.IdNavigation.FullName,
                Email = faculty.IdNavigation.Email,
                IsActive = faculty.IdNavigation.IsActive,
                AssignedCoursesCount = await _facultyRepository.GetAssignedCoursesCountAsync(id),
                CoordinatingBatchesCount = await _facultyRepository.GetCoordinatingBatchesCountAsync(id),
                CoordinatingCoursesCount = await _facultyRepository.GetCoordinatingCoursesCountAsync(id)
            };
        }

        public async Task<FacultyResponse> CreateAsync(CreateFacultyRequest request)
        {
            // Validate User exists
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
                throw new KeyNotFoundException("User not found");

            // Validate User has Faculty role
            if (user.Role != "Faculty")
                throw new InvalidOperationException("User must have Faculty role");

            // Validate User is active
            if (!user.IsActive || user.DeletedAt != null)
                throw new InvalidOperationException("User is not active");

            // Validate User is not already linked to a Faculty
            if (await _facultyRepository.UserIdExistsAsync(request.UserId))
                throw new InvalidOperationException("User is already linked to a Faculty record");

            // Validate EmployeeId is unique
            if (await _facultyRepository.EmployeeIdExistsAsync(request.EmployeeId))
                throw new InvalidOperationException("Employee ID already exists");

            // Validate Department exists
            if (!await _departmentRepository.ExistsAsync(request.DepartmentId))
                throw new KeyNotFoundException("Department not found");

            var faculty = new Faculty
            {
                Id = request.UserId, // Important: Use UserId as Id (1-to-1 relationship)
                EmployeeId = request.EmployeeId,
                DepartmentId = request.DepartmentId,
                Designation = request.Designation,
                JoiningDate = request.JoiningDate,
                Qualification = request.Qualification,
                Specialization = request.Specialization
            };

            await _facultyRepository.CreateAsync(faculty);

            // Reload with navigation properties
            faculty = await _facultyRepository.GetByIdAsync(faculty.Id);

            return new FacultyResponse
            {
                Id = faculty!.Id,
                EmployeeId = faculty.EmployeeId,
                DepartmentId = faculty.DepartmentId,
                DepartmentName = faculty.Department.Name,
                Designation = faculty.Designation,
                JoiningDate = faculty.JoiningDate,
                Qualification = faculty.Qualification,
                Specialization = faculty.Specialization,
                CreatedAt = faculty.CreatedAt,
                UpdatedAt = faculty.UpdatedAt,
                FullName = faculty.IdNavigation.FullName,
                Email = faculty.IdNavigation.Email
            };
        }

        public async Task<FacultyResponse> UpdateAsync(int id, UpdateFacultyRequest request)
        {
            var faculty = await _facultyRepository.GetByIdAsync(id);
            if (faculty == null)
                throw new KeyNotFoundException("Faculty not found");

            // Validate EmployeeId uniqueness if being changed
            if (!string.IsNullOrEmpty(request.EmployeeId) &&
                request.EmployeeId != faculty.EmployeeId &&
                await _facultyRepository.EmployeeIdExistsAsync(request.EmployeeId, id))
            {
                throw new InvalidOperationException("Employee ID already exists");
            }

            // Validate Department exists if being changed
            if (request.DepartmentId.HasValue &&
                !await _departmentRepository.ExistsAsync(request.DepartmentId.Value))
            {
                throw new KeyNotFoundException("Department not found");
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.EmployeeId))
                faculty.EmployeeId = request.EmployeeId;

            if (request.DepartmentId.HasValue)
                faculty.DepartmentId = request.DepartmentId.Value;

            faculty.Designation = request.Designation ?? faculty.Designation;
            faculty.JoiningDate = request.JoiningDate ?? faculty.JoiningDate;
            faculty.Qualification = request.Qualification ?? faculty.Qualification;
            faculty.Specialization = request.Specialization ?? faculty.Specialization;

            await _facultyRepository.UpdateAsync(faculty);

            // Reload with navigation properties
            faculty = await _facultyRepository.GetByIdAsync(id);

            return new FacultyResponse
            {
                Id = faculty!.Id,
                EmployeeId = faculty.EmployeeId,
                DepartmentId = faculty.DepartmentId,
                DepartmentName = faculty.Department.Name,
                Designation = faculty.Designation,
                JoiningDate = faculty.JoiningDate,
                Qualification = faculty.Qualification,
                Specialization = faculty.Specialization,
                CreatedAt = faculty.CreatedAt,
                UpdatedAt = faculty.UpdatedAt,
                FullName = faculty.IdNavigation.FullName,
                Email = faculty.IdNavigation.Email
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _facultyRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Faculty not found");

            // Check if faculty is coordinating any batches
            var coordinatingBatches = await _facultyRepository.GetCoordinatingBatchesCountAsync(id);
            if (coordinatingBatches > 0)
                throw new InvalidOperationException($"Cannot delete faculty who is coordinating {coordinatingBatches} batch(es)");

            // Check if faculty is coordinating any courses
            var coordinatingCourses = await _facultyRepository.GetCoordinatingCoursesCountAsync(id);
            if (coordinatingCourses > 0)
                throw new InvalidOperationException($"Cannot delete faculty who is coordinating {coordinatingCourses} course(s)");

            // Check if faculty is assigned to any courses
            var assignedCourses = await _facultyRepository.GetAssignedCoursesCountAsync(id);
            if (assignedCourses > 0)
                throw new InvalidOperationException($"Cannot delete faculty who is assigned to {assignedCourses} course(s)");

            // Check if faculty is HOD of any department
            var departments = await _departmentRepository.GetAllAsync(new DTOs.Department.Request.DepartmentFilterRequest
            {
                PageSize = int.MaxValue
            });
            var isHOD = departments.Departments.Any(d => d.HoduserId == id);
            if (isHOD)
                throw new InvalidOperationException("Cannot delete faculty who is HOD of a department");

            return await _facultyRepository.DeleteAsync(id);
        }
    }
}