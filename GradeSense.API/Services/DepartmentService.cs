using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Department.Request;
using GradeSense.API.DTOs.Department.Response;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IUserRepository _userRepository;

        public DepartmentService(
            IDepartmentRepository departmentRepository,
            IUserRepository userRepository)
        {
            _departmentRepository = departmentRepository;
            _userRepository = userRepository;
        }

        public async Task<PagedResponse<DepartmentResponse>> GetAllAsync(DepartmentFilterRequest filter)
        {
            var (departments, total) = await _departmentRepository.GetAllAsync(filter);

            var data = departments.Select(d => new DepartmentResponse
            {
                Id = d.Id,
                Name = d.Name,
                Code = d.Code,
                HODUserId = d.HoduserId,
                HODName = d.Hoduser?.FullName,
                IsActive = d.IsActive,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt
            }).ToList();

            return new PagedResponse<DepartmentResponse>(
                data,
                total,
                filter.PageNumber,
                filter.PageSize
            );
        }

        public async Task<DepartmentDetailResponse?> GetByIdAsync(int id)
        {
            var department = await _departmentRepository.GetByIdAsync(id);
            if (department == null) return null;

            return new DepartmentDetailResponse
            {
                Id = department.Id,
                Name = department.Name,
                Code = department.Code,
                HODUserId = department.HoduserId,
                HODName = department.Hoduser?.FullName,
                HODEmail = department.Hoduser?.Email,
                IsActive = department.IsActive,
                CreatedAt = department.CreatedAt,
                UpdatedAt = department.UpdatedAt,
                DeletedAt = department.DeletedAt,
                FacultyCount = await _departmentRepository.GetFacultyCountAsync(id),
                StudentCount = await _departmentRepository.GetStudentCountAsync(id),
                SubjectCount = await _departmentRepository.GetSubjectCountAsync(id),
                BatchCount = await _departmentRepository.GetBatchCountAsync(id)
            };
        }

        public async Task<DepartmentResponse> CreateAsync(CreateDepartmentRequest request)
        {
            if (await _departmentRepository.NameExistsAsync(request.Name))
                throw new InvalidOperationException("Department name already exists");

            if (!string.IsNullOrEmpty(request.Code) &&
                await _departmentRepository.CodeExistsAsync(request.Code))
                throw new InvalidOperationException("Department code already exists");

            if (request.HODUserId.HasValue)
            {
                var hod = await _userRepository.GetByIdAsync(request.HODUserId.Value);
                if (hod == null || hod.Role != "Faculty" || !hod.IsActive || hod.DeletedAt != null)
                    throw new InvalidOperationException("Invalid HOD user");
            }

            var department = new Department
            {
                Name = request.Name,
                Code = request.Code,
                HoduserId = request.HODUserId,
                IsActive = true
            };

            await _departmentRepository.CreateAsync(department);

            return new DepartmentResponse
            {
                Id = department.Id,
                Name = department.Name,
                Code = department.Code,
                HODUserId = department.HoduserId,
                IsActive = department.IsActive
            };
        }

        public async Task<DepartmentResponse> UpdateAsync(int id, UpdateDepartmentRequest request)
        {
            var department = await _departmentRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Department not found");

            if (!string.IsNullOrEmpty(request.Name) &&
                await _departmentRepository.NameExistsAsync(request.Name, id))
                throw new InvalidOperationException("Department name already exists");

            if (!string.IsNullOrEmpty(request.Code) &&
                await _departmentRepository.CodeExistsAsync(request.Code, id))
                throw new InvalidOperationException("Department code already exists");

            if (request.HODUserId.HasValue)
            {
                var hod = await _userRepository.GetByIdAsync(request.HODUserId.Value);
                if (hod == null || hod.Role != "Faculty" || !hod.IsActive || hod.DeletedAt != null)
                    throw new InvalidOperationException("Invalid HOD user");
            }

            department.Name = request.Name ?? department.Name;
            department.Code = request.Code ?? department.Code;
            department.HoduserId = request.HODUserId ?? department.HoduserId;
            department.IsActive = request.IsActive ?? department.IsActive;

            await _departmentRepository.UpdateAsync(department);

            return new DepartmentResponse
            {
                Id = department.Id,
                Name = department.Name,
                Code = department.Code,
                HODUserId = department.HoduserId,
                IsActive = department.IsActive
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _departmentRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Department not found");

            return await _departmentRepository.DeleteAsync(id);
        }
    }
}
