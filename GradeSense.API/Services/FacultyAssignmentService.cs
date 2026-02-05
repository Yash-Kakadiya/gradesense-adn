using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.FacultyAssignment.Request;
using GradeSense.API.DTOs.FacultyAssignment.Response;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class FacultyAssignmentService : IFacultyAssignmentService
    {
        private readonly IFacultyAssignmentRepository _facultyAssignmentRepository;
        private readonly ICourseOfferingRepository _courseOfferingRepository;
        private readonly IFacultyRepository _facultyRepository;

        public FacultyAssignmentService(
            IFacultyAssignmentRepository facultyAssignmentRepository,
            ICourseOfferingRepository courseOfferingRepository,
            IFacultyRepository facultyRepository)
        {
            _facultyAssignmentRepository = facultyAssignmentRepository;
            _courseOfferingRepository = courseOfferingRepository;
            _facultyRepository = facultyRepository;
        }

        public async Task<PagedResponse<FacultyAssignmentListResponse>> GetAllAsync(FacultyAssignmentFilterRequest filter)
        {
            var (facultyAssignments, total) = await _facultyAssignmentRepository.GetAllAsync(filter);

            var data = facultyAssignments.Select(fa => new FacultyAssignmentListResponse
            {
                Id = fa.Id,
                SubjectCode = fa.CourseOffering.Subject.Code,
                SubjectName = fa.CourseOffering.Subject.Name,
                BatchName = fa.CourseOffering.Batch.Name,
                FacultyName = fa.Faculty.IdNavigation.FullName,
                FacultyEmployeeId = fa.Faculty.EmployeeId,
                Role = fa.Role,
                AssignmentDate = fa.AssignmentDate,
                CreatedAt = fa.CreatedAt
            }).ToList();

            return new PagedResponse<FacultyAssignmentListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<FacultyAssignmentDetailResponse?> GetByIdAsync(int id)
        {
            var facultyAssignment = await _facultyAssignmentRepository.GetByIdAsync(id);
            if (facultyAssignment == null) return null;

            return new FacultyAssignmentDetailResponse
            {
                Id = facultyAssignment.Id,
                CourseOfferingId = facultyAssignment.CourseOfferingId,
                SubjectCode = facultyAssignment.CourseOffering.Subject.Code,
                SubjectName = facultyAssignment.CourseOffering.Subject.Name,
                SubjectCredit = facultyAssignment.CourseOffering.Subject.Credit,
                BatchName = facultyAssignment.CourseOffering.Batch.Name,
                BatchSemester = facultyAssignment.CourseOffering.Batch.Semester,
                DepartmentName = facultyAssignment.CourseOffering.Subject.Department.Name,
                AcademicYear = facultyAssignment.CourseOffering.AcademicYear,
                FacultyId = facultyAssignment.FacultyId,
                FacultyName = facultyAssignment.Faculty.IdNavigation.FullName,
                FacultyEmployeeId = facultyAssignment.Faculty.EmployeeId,
                FacultyEmail = facultyAssignment.Faculty.IdNavigation.PersonalEmail,
                FacultyDesignation = facultyAssignment.Faculty.Designation ?? string.Empty,
                Role = facultyAssignment.Role,
                AssignmentDate = facultyAssignment.AssignmentDate,
                CreatedAt = facultyAssignment.CreatedAt,
                UpdatedAt = facultyAssignment.UpdatedAt,
                DeletedAt = facultyAssignment.DeletedAt
            };
        }

        public async Task<FacultyAssignmentResponse> CreateAsync(CreateFacultyAssignmentRequest request)
        {
            // Validate CourseOffering exists
            var courseOffering = await _courseOfferingRepository.GetByIdAsync(request.CourseOfferingId);
            if (courseOffering == null)
                throw new KeyNotFoundException("Course offering not found");

            if (!courseOffering.IsActive)
                throw new InvalidOperationException("Course offering is not active");

            // Validate Faculty exists
            if (!await _facultyRepository.ExistsAsync(request.FacultyId))
                throw new KeyNotFoundException("Faculty not found");

            // Check if faculty already assigned to this course offering
            if (await _facultyAssignmentRepository.FacultyAlreadyAssignedAsync(request.CourseOfferingId, request.FacultyId))
                throw new InvalidOperationException("Faculty is already assigned to this course offering");

            var facultyAssignment = new FacultyAssignment
            {
                CourseOfferingId = request.CourseOfferingId,
                FacultyId = request.FacultyId,
                Role = request.Role,
                AssignmentDate = request.AssignmentDate ?? DateTime.Now
            };

            await _facultyAssignmentRepository.CreateAsync(facultyAssignment);

            // Reload with navigation properties
            facultyAssignment = await _facultyAssignmentRepository.GetByIdAsync(facultyAssignment.Id);

            return new FacultyAssignmentResponse
            {
                Id = facultyAssignment!.Id,
                CourseOfferingId = facultyAssignment.CourseOfferingId,
                SubjectCode = facultyAssignment.CourseOffering.Subject.Code,
                SubjectName = facultyAssignment.CourseOffering.Subject.Name,
                BatchName = facultyAssignment.CourseOffering.Batch.Name,
                FacultyId = facultyAssignment.FacultyId,
                FacultyName = facultyAssignment.Faculty.IdNavigation.FullName,
                FacultyEmployeeId = facultyAssignment.Faculty.EmployeeId,
                Role = facultyAssignment.Role,
                AssignmentDate = facultyAssignment.AssignmentDate,
                CreatedAt = facultyAssignment.CreatedAt,
                UpdatedAt = facultyAssignment.UpdatedAt
            };
        }

        public async Task<FacultyAssignmentResponse> UpdateAsync(int id, UpdateFacultyAssignmentRequest request)
        {
            var facultyAssignment = await _facultyAssignmentRepository.GetByIdAsync(id);
            if (facultyAssignment == null)
                throw new KeyNotFoundException("Faculty assignment not found");

            // Update fields if provided
            facultyAssignment.Role = request.Role ?? facultyAssignment.Role;
            facultyAssignment.AssignmentDate = request.AssignmentDate ?? facultyAssignment.AssignmentDate;

            await _facultyAssignmentRepository.UpdateAsync(facultyAssignment);

            // Reload with navigation properties
            facultyAssignment = await _facultyAssignmentRepository.GetByIdAsync(id);

            return new FacultyAssignmentResponse
            {
                Id = facultyAssignment!.Id,
                CourseOfferingId = facultyAssignment.CourseOfferingId,
                SubjectCode = facultyAssignment.CourseOffering.Subject.Code,
                SubjectName = facultyAssignment.CourseOffering.Subject.Name,
                BatchName = facultyAssignment.CourseOffering.Batch.Name,
                FacultyId = facultyAssignment.FacultyId,
                FacultyName = facultyAssignment.Faculty.IdNavigation.FullName,
                FacultyEmployeeId = facultyAssignment.Faculty.EmployeeId,
                Role = facultyAssignment.Role,
                AssignmentDate = facultyAssignment.AssignmentDate,
                CreatedAt = facultyAssignment.CreatedAt,
                UpdatedAt = facultyAssignment.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _facultyAssignmentRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Faculty assignment not found");

            return await _facultyAssignmentRepository.DeleteAsync(id);
        }
    }
}