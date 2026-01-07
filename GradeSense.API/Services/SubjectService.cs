using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Subject.Request;
using GradeSense.API.DTOs.Subject.Response;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class SubjectService : ISubjectService
    {
        private readonly ISubjectRepository _subjectRepository;
        private readonly IDepartmentRepository _departmentRepository;

        public SubjectService(
            ISubjectRepository subjectRepository,
            IDepartmentRepository departmentRepository)
        {
            _subjectRepository = subjectRepository;
            _departmentRepository = departmentRepository;
        }

        public async Task<PagedResponse<SubjectListResponse>> GetAllAsync(SubjectFilterRequest filter)
        {
            var (subjects, total) = await _subjectRepository.GetAllAsync(filter);

            var data = subjects.Select(s => new SubjectListResponse
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                Credit = s.Credit,
                DepartmentName = s.Department.Name,
                Semester = s.Semester,
                SubjectType = s.SubjectType,
                IsElective = s.IsElective,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt
            }).ToList();

            return new PagedResponse<SubjectListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<SubjectDetailResponse?> GetByIdAsync(int id)
        {
            var subject = await _subjectRepository.GetByIdAsync(id);
            if (subject == null) return null;

            return new SubjectDetailResponse
            {
                Id = subject.Id,
                Code = subject.Code,
                Name = subject.Name,
                Credit = subject.Credit,
                DepartmentId = subject.DepartmentId,
                DepartmentName = subject.Department.Name,
                DepartmentCode = subject.Department.Code,
                Semester = subject.Semester,
                SubjectType = subject.SubjectType,
                IsElective = subject.IsElective,
                PrerequisiteSubjectId = subject.PrerequisiteSubjectId,
                PrerequisiteSubjectCode = subject.PrerequisiteSubject?.Code,
                PrerequisiteSubjectName = subject.PrerequisiteSubject?.Name,
                Description = subject.Description,
                Syllabus = subject.Syllabus,
                IsActive = subject.IsActive,
                CreatedAt = subject.CreatedAt,
                UpdatedAt = subject.UpdatedAt,
                DeletedAt = subject.DeletedAt,
                SubjectUnitsCount = await _subjectRepository.GetSubjectUnitsCountAsync(id),
                CourseOfferingsCount = await _subjectRepository.GetCourseOfferingsCountAsync(id),
                DependentSubjectsCount = await _subjectRepository.GetDependentSubjectsCountAsync(id)
            };
        }

        public async Task<SubjectResponse> CreateAsync(CreateSubjectRequest request)
        {
            // Validate Code is unique
            if (await _subjectRepository.CodeExistsAsync(request.Code))
                throw new InvalidOperationException("Subject code already exists");

            // Validate Department exists
            if (!await _departmentRepository.ExistsAsync(request.DepartmentId))
                throw new KeyNotFoundException("Department not found");

            // Validate PrerequisiteSubject exists if provided
            if (request.PrerequisiteSubjectId.HasValue)
            {
                if (!await _subjectRepository.ExistsAsync(request.PrerequisiteSubjectId.Value))
                    throw new KeyNotFoundException("Prerequisite subject not found");
            }

            var subject = new Subject
            {
                Code = request.Code,
                Name = request.Name,
                Credit = request.Credit,
                DepartmentId = request.DepartmentId,
                Semester = request.Semester,
                SubjectType = request.SubjectType,
                IsElective = request.IsElective,
                PrerequisiteSubjectId = request.PrerequisiteSubjectId,
                Description = request.Description,
                Syllabus = request.Syllabus,
                IsActive = request.IsActive
            };

            await _subjectRepository.CreateAsync(subject);

            // Reload with navigation properties
            subject = await _subjectRepository.GetByIdAsync(subject.Id);

            return new SubjectResponse
            {
                Id = subject!.Id,
                Code = subject.Code,
                Name = subject.Name,
                Credit = subject.Credit,
                DepartmentId = subject.DepartmentId,
                DepartmentName = subject.Department.Name,
                Semester = subject.Semester,
                SubjectType = subject.SubjectType,
                IsElective = subject.IsElective,
                PrerequisiteSubjectId = subject.PrerequisiteSubjectId,
                PrerequisiteSubjectCode = subject.PrerequisiteSubject?.Code,
                PrerequisiteSubjectName = subject.PrerequisiteSubject?.Name,
                IsActive = subject.IsActive,
                CreatedAt = subject.CreatedAt,
                UpdatedAt = subject.UpdatedAt
            };
        }

        public async Task<SubjectResponse> UpdateAsync(int id, UpdateSubjectRequest request)
        {
            var subject = await _subjectRepository.GetByIdAsync(id);
            if (subject == null)
                throw new KeyNotFoundException("Subject not found");

            // Validate Code uniqueness if being changed
            if (!string.IsNullOrEmpty(request.Code) &&
                request.Code != subject.Code &&
                await _subjectRepository.CodeExistsAsync(request.Code, id))
            {
                throw new InvalidOperationException("Subject code already exists");
            }

            // Validate Department exists if being changed
            if (request.DepartmentId.HasValue &&
                !await _departmentRepository.ExistsAsync(request.DepartmentId.Value))
            {
                throw new KeyNotFoundException("Department not found");
            }

            // Validate PrerequisiteSubject exists if being changed
            if (request.PrerequisiteSubjectId.HasValue)
            {
                // Prevent circular dependency (subject cannot be its own prerequisite)
                if (request.PrerequisiteSubjectId.Value == id)
                    throw new InvalidOperationException("Subject cannot be its own prerequisite");

                if (!await _subjectRepository.ExistsAsync(request.PrerequisiteSubjectId.Value))
                    throw new KeyNotFoundException("Prerequisite subject not found");
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.Code))
                subject.Code = request.Code;

            if (!string.IsNullOrEmpty(request.Name))
                subject.Name = request.Name;

            if (request.Credit.HasValue)
                subject.Credit = request.Credit.Value;

            if (request.DepartmentId.HasValue)
                subject.DepartmentId = request.DepartmentId.Value;

            subject.Semester = request.Semester ?? subject.Semester;
            subject.SubjectType = request.SubjectType ?? subject.SubjectType;

            if (request.IsElective.HasValue)
                subject.IsElective = request.IsElective.Value;

            // Allow setting PrerequisiteSubjectId to null
            if (request.PrerequisiteSubjectId != null)
                subject.PrerequisiteSubjectId = request.PrerequisiteSubjectId;

            subject.Description = request.Description ?? subject.Description;
            subject.Syllabus = request.Syllabus ?? subject.Syllabus;

            if (request.IsActive.HasValue)
                subject.IsActive = request.IsActive.Value;

            await _subjectRepository.UpdateAsync(subject);

            // Reload with navigation properties
            subject = await _subjectRepository.GetByIdAsync(id);

            return new SubjectResponse
            {
                Id = subject!.Id,
                Code = subject.Code,
                Name = subject.Name,
                Credit = subject.Credit,
                DepartmentId = subject.DepartmentId,
                DepartmentName = subject.Department.Name,
                Semester = subject.Semester,
                SubjectType = subject.SubjectType,
                IsElective = subject.IsElective,
                PrerequisiteSubjectId = subject.PrerequisiteSubjectId,
                PrerequisiteSubjectCode = subject.PrerequisiteSubject?.Code,
                PrerequisiteSubjectName = subject.PrerequisiteSubject?.Name,
                IsActive = subject.IsActive,
                CreatedAt = subject.CreatedAt,
                UpdatedAt = subject.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _subjectRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Subject not found");

            // Check if subject has any course offerings
            var courseOfferingsCount = await _subjectRepository.GetCourseOfferingsCountAsync(id);
            if (courseOfferingsCount > 0)
                throw new InvalidOperationException($"Cannot delete subject that has {courseOfferingsCount} course offering(s)");

            // Check if subject has any subject units
            var subjectUnitsCount = await _subjectRepository.GetSubjectUnitsCountAsync(id);
            if (subjectUnitsCount > 0)
                throw new InvalidOperationException($"Cannot delete subject that has {subjectUnitsCount} subject unit(s)");

            // Check if subject is a prerequisite for other subjects
            var dependentSubjectsCount = await _subjectRepository.GetDependentSubjectsCountAsync(id);
            if (dependentSubjectsCount > 0)
                throw new InvalidOperationException($"Cannot delete subject that is a prerequisite for {dependentSubjectsCount} other subject(s)");

            return await _subjectRepository.DeleteAsync(id);
        }
    }
}