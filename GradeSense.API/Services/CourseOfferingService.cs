using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.CourseOffering.Request;
using GradeSense.API.DTOs.CourseOffering.Response;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;
using Microsoft.Extensions.Logging;

namespace GradeSense.API.Services
{
    public class CourseOfferingService : ICourseOfferingService
    {
        private readonly ICourseOfferingRepository _courseOfferingRepository;
        private readonly ISubjectRepository _subjectRepository;
        private readonly IBatchRepository _batchRepository;
        private readonly IFacultyRepository _facultyRepository;
        private readonly ILogger<CourseOfferingService> _logger;

        public CourseOfferingService(
            ICourseOfferingRepository courseOfferingRepository,
            ISubjectRepository subjectRepository,
            IBatchRepository batchRepository,
            IFacultyRepository facultyRepository,
            ILogger<CourseOfferingService> logger)
        {
            _courseOfferingRepository = courseOfferingRepository;
            _subjectRepository = subjectRepository;
            _batchRepository = batchRepository;
            _facultyRepository = facultyRepository;
            _logger = logger;
        }

        public async Task<PagedResponse<CourseOfferingListResponse>> GetAllAsync(CourseOfferingFilterRequest filter)
        {
            var (courseOfferings, total) = await _courseOfferingRepository.GetAllAsync(filter);

            var data = courseOfferings.Select(co => new CourseOfferingListResponse
            {
                Id = co.Id,
                SubjectCode = co.Subject.Code,
                SubjectName = co.Subject.Name,
                BatchName = co.Batch.Name,
                SubjectCoordinatorName = co.SubjectCoordinator.IdNavigation.FullName,
                AcademicYear = co.AcademicYear,
                MaxEnrollment = co.MaxEnrollment,
                IsActive = co.IsActive,
                CreatedAt = co.CreatedAt
            }).ToList();

            return new PagedResponse<CourseOfferingListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<CourseOfferingDetailResponse?> GetByIdAsync(int id)
        {
            var courseOffering = await _courseOfferingRepository.GetByIdAsync(id);
            if (courseOffering == null) return null;

            return new CourseOfferingDetailResponse
            {
                Id = courseOffering.Id,
                SubjectId = courseOffering.SubjectId,
                SubjectCode = courseOffering.Subject.Code,
                SubjectName = courseOffering.Subject.Name,
                SubjectCredit = courseOffering.Subject.Credit,
                SubjectDepartmentName = courseOffering.Subject.Department.Name,
                BatchId = courseOffering.BatchId,
                BatchName = courseOffering.Batch.Name,
                BatchSemester = courseOffering.Batch.Semester,
                BatchDepartmentName = courseOffering.Batch.Department.Name,
                SubjectCoordinatorId = courseOffering.SubjectCoordinatorId,
                SubjectCoordinatorName = courseOffering.SubjectCoordinator.IdNavigation.FullName,
                SubjectCoordinatorEmployeeId = courseOffering.SubjectCoordinator.EmployeeId,
                SubjectCoordinatorEmail = courseOffering.SubjectCoordinator.IdNavigation.PersonalEmail,
                AcademicYear = courseOffering.AcademicYear,
                StartDate = courseOffering.StartDate,
                EndDate = courseOffering.EndDate,
                MaxEnrollment = courseOffering.MaxEnrollment,
                IsActive = courseOffering.IsActive,
                CreatedAt = courseOffering.CreatedAt,
                UpdatedAt = courseOffering.UpdatedAt,
                DeletedAt = courseOffering.DeletedAt,
                CourseEnrollmentsCount = await _courseOfferingRepository.GetCourseEnrollmentsCountAsync(id),
                ActiveEnrollmentsCount = await _courseOfferingRepository.GetActiveEnrollmentsCountAsync(id),
                EvaluationSchemesCount = await _courseOfferingRepository.GetEvaluationSchemesCountAsync(id),
                FacultyAssignmentsCount = await _courseOfferingRepository.GetFacultyAssignmentsCountAsync(id)
            };
        }

        public async Task<CourseOfferingResponse> CreateAsync(CreateCourseOfferingRequest request)
        {
            // Validate Subject exists
            var subject = await _subjectRepository.GetByIdAsync(request.SubjectId);
            if (subject == null)
                throw new KeyNotFoundException("Subject not found");

            if (!subject.IsActive)
                throw new InvalidOperationException("Subject is not active");

            // Validate Batch exists
            var batch = await _batchRepository.GetByIdAsync(request.BatchId);
            if (batch == null)
                throw new KeyNotFoundException("Batch not found");

            if (!batch.IsActive)
                throw new InvalidOperationException("Batch is not active");

            // Validate SubjectCoordinator exists
            if (!await _facultyRepository.ExistsAsync(request.SubjectCoordinatorId))
                throw new KeyNotFoundException("Subject coordinator (Faculty) not found");

            // Soft validation: Check if Subject.DepartmentId matches Batch.DepartmentId
            if (subject.DepartmentId != batch.DepartmentId)
            {
                _logger.LogWarning(
                    "Cross-department course offering created: Subject '{SubjectCode}' (Dept: {SubjectDept}) " +
                    "assigned to Batch '{BatchName}' (Dept: {BatchDept})",
                    subject.Code, subject.Department.Name, batch.Name, batch.Department.Name);
            }

            // Optional: Validate AcademicYear matches Batch.AcademicYear
            if (request.AcademicYear != batch.AcademicYear)
            {
                _logger.LogWarning(
                    "Academic year mismatch: Course offering year {CourseYear} differs from Batch year {BatchYear}",
                    request.AcademicYear, batch.AcademicYear);
            }

            var courseOffering = new CourseOffering
            {
                SubjectId = request.SubjectId,
                BatchId = request.BatchId,
                SubjectCoordinatorId = request.SubjectCoordinatorId,
                AcademicYear = request.AcademicYear,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                MaxEnrollment = request.MaxEnrollment,
                IsActive = request.IsActive
            };

            await _courseOfferingRepository.CreateAsync(courseOffering);

            // Reload with navigation properties
            courseOffering = await _courseOfferingRepository.GetByIdAsync(courseOffering.Id);

            return new CourseOfferingResponse
            {
                Id = courseOffering!.Id,
                SubjectId = courseOffering.SubjectId,
                SubjectCode = courseOffering.Subject.Code,
                SubjectName = courseOffering.Subject.Name,
                BatchId = courseOffering.BatchId,
                BatchName = courseOffering.Batch.Name,
                SubjectCoordinatorId = courseOffering.SubjectCoordinatorId,
                SubjectCoordinatorName = courseOffering.SubjectCoordinator.IdNavigation.FullName,
                SubjectCoordinatorEmployeeId = courseOffering.SubjectCoordinator.EmployeeId,
                AcademicYear = courseOffering.AcademicYear,
                StartDate = courseOffering.StartDate,
                EndDate = courseOffering.EndDate,
                MaxEnrollment = courseOffering.MaxEnrollment,
                IsActive = courseOffering.IsActive,
                CreatedAt = courseOffering.CreatedAt,
                UpdatedAt = courseOffering.UpdatedAt
            };
        }

        public async Task<CourseOfferingResponse> UpdateAsync(int id, UpdateCourseOfferingRequest request)
        {
            var courseOffering = await _courseOfferingRepository.GetByIdAsync(id);
            if (courseOffering == null)
                throw new KeyNotFoundException("Course offering not found");

            // Validate Subject exists if being changed
            if (request.SubjectId.HasValue)
            {
                var subject = await _subjectRepository.GetByIdAsync(request.SubjectId.Value);
                if (subject == null)
                    throw new KeyNotFoundException("Subject not found");

                if (!subject.IsActive)
                    throw new InvalidOperationException("Subject is not active");
            }

            // Validate Batch exists if being changed
            if (request.BatchId.HasValue)
            {
                var batch = await _batchRepository.GetByIdAsync(request.BatchId.Value);
                if (batch == null)
                    throw new KeyNotFoundException("Batch not found");

                if (!batch.IsActive)
                    throw new InvalidOperationException("Batch is not active");
            }

            // Validate SubjectCoordinator exists if being changed
            if (request.SubjectCoordinatorId.HasValue &&
                !await _facultyRepository.ExistsAsync(request.SubjectCoordinatorId.Value))
            {
                throw new KeyNotFoundException("Subject coordinator (Faculty) not found");
            }

            // Update fields if provided
            if (request.SubjectId.HasValue)
                courseOffering.SubjectId = request.SubjectId.Value;

            if (request.BatchId.HasValue)
                courseOffering.BatchId = request.BatchId.Value;

            if (request.SubjectCoordinatorId.HasValue)
                courseOffering.SubjectCoordinatorId = request.SubjectCoordinatorId.Value;

            if (request.AcademicYear.HasValue)
                courseOffering.AcademicYear = request.AcademicYear.Value;

            courseOffering.StartDate = request.StartDate ?? courseOffering.StartDate;
            courseOffering.EndDate = request.EndDate ?? courseOffering.EndDate;
            courseOffering.MaxEnrollment = request.MaxEnrollment ?? courseOffering.MaxEnrollment;

            if (request.IsActive.HasValue)
                courseOffering.IsActive = request.IsActive.Value;

            await _courseOfferingRepository.UpdateAsync(courseOffering);

            // Reload with navigation properties
            courseOffering = await _courseOfferingRepository.GetByIdAsync(id);

            return new CourseOfferingResponse
            {
                Id = courseOffering!.Id,
                SubjectId = courseOffering.SubjectId,
                SubjectCode = courseOffering.Subject.Code,
                SubjectName = courseOffering.Subject.Name,
                BatchId = courseOffering.BatchId,
                BatchName = courseOffering.Batch.Name,
                SubjectCoordinatorId = courseOffering.SubjectCoordinatorId,
                SubjectCoordinatorName = courseOffering.SubjectCoordinator.IdNavigation.FullName,
                SubjectCoordinatorEmployeeId = courseOffering.SubjectCoordinator.EmployeeId,
                AcademicYear = courseOffering.AcademicYear,
                StartDate = courseOffering.StartDate,
                EndDate = courseOffering.EndDate,
                MaxEnrollment = courseOffering.MaxEnrollment,
                IsActive = courseOffering.IsActive,
                CreatedAt = courseOffering.CreatedAt,
                UpdatedAt = courseOffering.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _courseOfferingRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Course offering not found");

            // Check if course offering has any enrollments
            var enrollmentsCount = await _courseOfferingRepository.GetCourseEnrollmentsCountAsync(id);
            if (enrollmentsCount > 0)
                throw new InvalidOperationException($"Cannot delete course offering that has {enrollmentsCount} enrollment(s)");

            // Check if course offering has any evaluation schemes
            var evaluationSchemesCount = await _courseOfferingRepository.GetEvaluationSchemesCountAsync(id);
            if (evaluationSchemesCount > 0)
                throw new InvalidOperationException($"Cannot delete course offering that has {evaluationSchemesCount} evaluation scheme(s)");

            // Check if course offering has any faculty assignments
            var facultyAssignmentsCount = await _courseOfferingRepository.GetFacultyAssignmentsCountAsync(id);
            if (facultyAssignmentsCount > 0)
                throw new InvalidOperationException($"Cannot delete course offering that has {facultyAssignmentsCount} faculty assignment(s)");

            return await _courseOfferingRepository.DeleteAsync(id);
        }
    }
}