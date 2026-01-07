using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.SubjectUnit.Request;
using GradeSense.API.DTOs.SubjectUnit.Response;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class SubjectUnitService : ISubjectUnitService
    {
        private readonly ISubjectUnitRepository _subjectUnitRepository;
        private readonly ISubjectRepository _subjectRepository;

        public SubjectUnitService(
            ISubjectUnitRepository subjectUnitRepository,
            ISubjectRepository subjectRepository)
        {
            _subjectUnitRepository = subjectUnitRepository;
            _subjectRepository = subjectRepository;
        }

        public async Task<PagedResponse<SubjectUnitListResponse>> GetAllAsync(SubjectUnitFilterRequest filter)
        {
            var (subjectUnits, total) = await _subjectUnitRepository.GetAllAsync(filter);

            var data = subjectUnits.Select(su => new SubjectUnitListResponse
            {
                Id = su.Id,
                SubjectId = su.SubjectId,
                SubjectCode = su.Subject.Code,
                SubjectName = su.Subject.Name,
                UnitNumber = su.UnitNumber,
                TopicName = su.TopicName,
                TeachingHours = su.TeachingHours,
                Weightage = su.Weightage,
                CreatedAt = su.CreatedAt
            }).ToList();

            return new PagedResponse<SubjectUnitListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<SubjectUnitDetailResponse?> GetByIdAsync(int id)
        {
            var subjectUnit = await _subjectUnitRepository.GetByIdAsync(id);
            if (subjectUnit == null) return null;

            return new SubjectUnitDetailResponse
            {
                Id = subjectUnit.Id,
                SubjectId = subjectUnit.SubjectId,
                SubjectCode = subjectUnit.Subject.Code,
                SubjectName = subjectUnit.Subject.Name,
                UnitNumber = subjectUnit.UnitNumber,
                TopicName = subjectUnit.TopicName,
                Description = subjectUnit.Description,
                TeachingHours = subjectUnit.TeachingHours,
                Weightage = subjectUnit.Weightage,
                LearningOutcomes = subjectUnit.LearningOutcomes,
                CreatedAt = subjectUnit.CreatedAt,
                UpdatedAt = subjectUnit.UpdatedAt,
                DeletedAt = subjectUnit.DeletedAt,
                AssessmentItemsCount = await _subjectUnitRepository.GetAssessmentItemsCountAsync(id)
            };
        }

        public async Task<SubjectUnitResponse> CreateAsync(CreateSubjectUnitRequest request)
        {
            // Validate Subject exists
            if (!await _subjectRepository.ExistsAsync(request.SubjectId))
                throw new KeyNotFoundException("Subject not found");

            // Validate UnitNumber is unique for this subject
            if (await _subjectUnitRepository.UnitNumberExistsForSubjectAsync(request.SubjectId, request.UnitNumber))
                throw new InvalidOperationException($"Unit number {request.UnitNumber} already exists for this subject");

            var subjectUnit = new SubjectUnit
            {
                SubjectId = request.SubjectId,
                UnitNumber = request.UnitNumber,
                TopicName = request.TopicName,
                Description = request.Description,
                TeachingHours = request.TeachingHours,
                Weightage = request.Weightage,
                LearningOutcomes = request.LearningOutcomes
            };

            await _subjectUnitRepository.CreateAsync(subjectUnit);

            // Reload with navigation properties
            subjectUnit = await _subjectUnitRepository.GetByIdAsync(subjectUnit.Id);

            return new SubjectUnitResponse
            {
                Id = subjectUnit!.Id,
                SubjectId = subjectUnit.SubjectId,
                SubjectCode = subjectUnit.Subject.Code,
                SubjectName = subjectUnit.Subject.Name,
                UnitNumber = subjectUnit.UnitNumber,
                TopicName = subjectUnit.TopicName,
                Description = subjectUnit.Description,
                TeachingHours = subjectUnit.TeachingHours,
                Weightage = subjectUnit.Weightage,
                LearningOutcomes = subjectUnit.LearningOutcomes,
                CreatedAt = subjectUnit.CreatedAt,
                UpdatedAt = subjectUnit.UpdatedAt
            };
        }

        public async Task<SubjectUnitResponse> UpdateAsync(int id, UpdateSubjectUnitRequest request)
        {
            var subjectUnit = await _subjectUnitRepository.GetByIdAsync(id);
            if (subjectUnit == null)
                throw new KeyNotFoundException("Subject unit not found");

            // Validate Subject exists if being changed
            if (request.SubjectId.HasValue &&
                !await _subjectRepository.ExistsAsync(request.SubjectId.Value))
            {
                throw new KeyNotFoundException("Subject not found");
            }

            // Validate UnitNumber uniqueness if being changed
            if (request.UnitNumber.HasValue || request.SubjectId.HasValue)
            {
                var subjectIdToCheck = request.SubjectId ?? subjectUnit.SubjectId;
                var unitNumberToCheck = request.UnitNumber ?? subjectUnit.UnitNumber;

                if (await _subjectUnitRepository.UnitNumberExistsForSubjectAsync(subjectIdToCheck, unitNumberToCheck, id))
                {
                    throw new InvalidOperationException($"Unit number {unitNumberToCheck} already exists for this subject");
                }
            }

            // Update fields if provided
            if (request.SubjectId.HasValue)
                subjectUnit.SubjectId = request.SubjectId.Value;

            if (request.UnitNumber.HasValue)
                subjectUnit.UnitNumber = request.UnitNumber.Value;

            if (!string.IsNullOrEmpty(request.TopicName))
                subjectUnit.TopicName = request.TopicName;

            subjectUnit.Description = request.Description ?? subjectUnit.Description;

            if (request.TeachingHours.HasValue)
                subjectUnit.TeachingHours = request.TeachingHours.Value;

            subjectUnit.Weightage = request.Weightage ?? subjectUnit.Weightage;
            subjectUnit.LearningOutcomes = request.LearningOutcomes ?? subjectUnit.LearningOutcomes;

            await _subjectUnitRepository.UpdateAsync(subjectUnit);

            // Reload with navigation properties
            subjectUnit = await _subjectUnitRepository.GetByIdAsync(id);

            return new SubjectUnitResponse
            {
                Id = subjectUnit!.Id,
                SubjectId = subjectUnit.SubjectId,
                SubjectCode = subjectUnit.Subject.Code,
                SubjectName = subjectUnit.Subject.Name,
                UnitNumber = subjectUnit.UnitNumber,
                TopicName = subjectUnit.TopicName,
                Description = subjectUnit.Description,
                TeachingHours = subjectUnit.TeachingHours,
                Weightage = subjectUnit.Weightage,
                LearningOutcomes = subjectUnit.LearningOutcomes,
                CreatedAt = subjectUnit.CreatedAt,
                UpdatedAt = subjectUnit.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _subjectUnitRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Subject unit not found");

            // Check if subject unit has any assessment items
            var assessmentItemsCount = await _subjectUnitRepository.GetAssessmentItemsCountAsync(id);
            if (assessmentItemsCount > 0)
                throw new InvalidOperationException($"Cannot delete subject unit that has {assessmentItemsCount} assessment item(s)");

            return await _subjectUnitRepository.DeleteAsync(id);
        }
    }
}