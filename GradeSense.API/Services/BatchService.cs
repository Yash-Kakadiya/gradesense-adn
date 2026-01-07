using GradeSense.API.DTOs.Batch.Request;
using GradeSense.API.DTOs.Batch.Response;
using GradeSense.API.DTOs.Common;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class BatchService : IBatchService
    {
        private readonly IBatchRepository _batchRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IFacultyRepository _facultyRepository;

        public BatchService(
            IBatchRepository batchRepository,
            IDepartmentRepository departmentRepository,
            IFacultyRepository facultyRepository)
        {
            _batchRepository = batchRepository;
            _departmentRepository = departmentRepository;
            _facultyRepository = facultyRepository;
        }

        public async Task<PagedResponse<BatchListResponse>> GetAllAsync(BatchFilterRequest filter)
        {
            var (batches, total) = await _batchRepository.GetAllAsync(filter);

            var data = batches.Select(b => new BatchListResponse
            {
                Id = b.Id,
                Name = b.Name,
                Semester = b.Semester,
                AcademicYear = b.AcademicYear,
                DepartmentName = b.Department.Name,
                ClassCoordinatorName = b.ClassCoordinator?.IdNavigation.FullName,
                Division = b.Division,
                IsActive = b.IsActive,
                CreatedAt = b.CreatedAt
            }).ToList();

            return new PagedResponse<BatchListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<BatchDetailResponse?> GetByIdAsync(int id)
        {
            var batch = await _batchRepository.GetByIdAsync(id);
            if (batch == null) return null;

            return new BatchDetailResponse
            {
                Id = batch.Id,
                Name = batch.Name,
                Semester = batch.Semester,
                AcademicYear = batch.AcademicYear,
                DepartmentId = batch.DepartmentId,
                DepartmentName = batch.Department.Name,
                DepartmentCode = batch.Department.Code,
                ClassCoordinatorId = batch.ClassCoordinatorId,
                ClassCoordinatorName = batch.ClassCoordinator?.IdNavigation.FullName,
                ClassCoordinatorEmail = batch.ClassCoordinator?.IdNavigation.Email,
                ClassCoordinatorEmployeeId = batch.ClassCoordinator?.EmployeeId,
                Division = batch.Division,
                IsActive = batch.IsActive,
                CreatedAt = batch.CreatedAt,
                UpdatedAt = batch.UpdatedAt,
                DeletedAt = batch.DeletedAt,
                CourseOfferingsCount = await _batchRepository.GetCourseOfferingsCountAsync(id)
            };
        }

        public async Task<BatchResponse> CreateAsync(CreateBatchRequest request)
        {
            // Validate Department exists
            if (!await _departmentRepository.ExistsAsync(request.DepartmentId))
                throw new KeyNotFoundException("Department not found");

            // Validate ClassCoordinator exists if provided
            if (request.ClassCoordinatorId.HasValue)
            {
                if (!await _facultyRepository.ExistsAsync(request.ClassCoordinatorId.Value))
                    throw new KeyNotFoundException("Class coordinator (Faculty) not found");
            }

            var batch = new Batch
            {
                Name = request.Name,
                Semester = request.Semester,
                AcademicYear = request.AcademicYear,
                DepartmentId = request.DepartmentId,
                ClassCoordinatorId = request.ClassCoordinatorId,
                Division = request.Division,
                IsActive = request.IsActive
            };

            await _batchRepository.CreateAsync(batch);

            // Reload with navigation properties
            batch = await _batchRepository.GetByIdAsync(batch.Id);

            return new BatchResponse
            {
                Id = batch!.Id,
                Name = batch.Name,
                Semester = batch.Semester,
                AcademicYear = batch.AcademicYear,
                DepartmentId = batch.DepartmentId,
                DepartmentName = batch.Department.Name,
                ClassCoordinatorId = batch.ClassCoordinatorId,
                ClassCoordinatorName = batch.ClassCoordinator?.IdNavigation.FullName,
                Division = batch.Division,
                IsActive = batch.IsActive,
                CreatedAt = batch.CreatedAt,
                UpdatedAt = batch.UpdatedAt
            };
        }

        public async Task<BatchResponse> UpdateAsync(int id, UpdateBatchRequest request)
        {
            var batch = await _batchRepository.GetByIdAsync(id);
            if (batch == null)
                throw new KeyNotFoundException("Batch not found");

            // Validate Department exists if being changed
            if (request.DepartmentId.HasValue &&
                !await _departmentRepository.ExistsAsync(request.DepartmentId.Value))
            {
                throw new KeyNotFoundException("Department not found");
            }

            // Validate ClassCoordinator exists if being changed
            if (request.ClassCoordinatorId.HasValue &&
                !await _facultyRepository.ExistsAsync(request.ClassCoordinatorId.Value))
            {
                throw new KeyNotFoundException("Class coordinator (Faculty) not found");
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.Name))
                batch.Name = request.Name;

            if (request.Semester.HasValue)
                batch.Semester = request.Semester.Value;

            if (request.AcademicYear.HasValue)
                batch.AcademicYear = request.AcademicYear.Value;

            if (request.DepartmentId.HasValue)
                batch.DepartmentId = request.DepartmentId.Value;

            // Allow setting ClassCoordinatorId to null
            if (request.ClassCoordinatorId != null)
                batch.ClassCoordinatorId = request.ClassCoordinatorId;

            batch.Division = request.Division ?? batch.Division;

            if (request.IsActive.HasValue)
                batch.IsActive = request.IsActive.Value;

            await _batchRepository.UpdateAsync(batch);

            // Reload with navigation properties
            batch = await _batchRepository.GetByIdAsync(id);

            return new BatchResponse
            {
                Id = batch!.Id,
                Name = batch.Name,
                Semester = batch.Semester,
                AcademicYear = batch.AcademicYear,
                DepartmentId = batch.DepartmentId,
                DepartmentName = batch.Department.Name,
                ClassCoordinatorId = batch.ClassCoordinatorId,
                ClassCoordinatorName = batch.ClassCoordinator?.IdNavigation.FullName,
                Division = batch.Division,
                IsActive = batch.IsActive,
                CreatedAt = batch.CreatedAt,
                UpdatedAt = batch.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _batchRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Batch not found");

            // Check if batch has any course offerings
            var courseOfferingsCount = await _batchRepository.GetCourseOfferingsCountAsync(id);
            if (courseOfferingsCount > 0)
                throw new InvalidOperationException($"Cannot delete batch that has {courseOfferingsCount} course offering(s)");

            return await _batchRepository.DeleteAsync(id);
        }
    }
}