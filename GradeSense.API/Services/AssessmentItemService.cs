using GradeSense.API.DTOs.AssessmentItem.Request;
using GradeSense.API.DTOs.AssessmentItem.Response;
using GradeSense.API.DTOs.Common;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class AssessmentItemService : IAssessmentItemService
    {
        private readonly IAssessmentItemRepository _assessmentItemRepository;
        private readonly IEvaluationSchemeRepository _evaluationSchemeRepository;
        private readonly ISubjectUnitRepository _subjectUnitRepository;
        private readonly IFacultyRepository _facultyRepository;
        private readonly IStudentMarkRepository _studentMarkRepository;
        private readonly ILogger<AssessmentItemService> _logger;

        public AssessmentItemService(
            IAssessmentItemRepository assessmentItemRepository,
            IEvaluationSchemeRepository evaluationSchemeRepository,
            ISubjectUnitRepository subjectUnitRepository,
            IFacultyRepository facultyRepository,
            IStudentMarkRepository studentMarkRepository,
            ILogger<AssessmentItemService> logger)
        {
            _assessmentItemRepository = assessmentItemRepository;
            _evaluationSchemeRepository = evaluationSchemeRepository;
            _subjectUnitRepository = subjectUnitRepository;
            _facultyRepository = facultyRepository;
            _studentMarkRepository = studentMarkRepository;
            _logger = logger;
        }

        public async Task<PagedResponse<AssessmentItemListResponse>> GetAllAsync(AssessmentItemFilterRequest filter)
        {
            var (assessmentItems, total) = await _assessmentItemRepository.GetAllAsync(filter);

            var data = assessmentItems.Select(ai => new AssessmentItemListResponse
            {
                Id = ai.Id,
                EvaluationSchemeId = ai.EvaluationSchemeId,
                EvaluationSchemeName = ai.EvaluationScheme.Name,
                SubjectCode = ai.EvaluationScheme.CourseOffering.Subject.Code,
                SubjectName = ai.EvaluationScheme.CourseOffering.Subject.Name,
                Name = ai.Name,
                Description = ai.Description,
                MaxMarks = ai.MaxMarks,
                Weight = ai.Weight,
                CalculationType = ai.CalculationType,
                ScheduledDate = ai.ScheduledDate,
                DueDate = ai.DueDate,
                IsActive = ai.IsActive,
                CreatedAt = ai.CreatedAt
            }).ToList();

            return new PagedResponse<AssessmentItemListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<AssessmentItemDetailResponse?> GetByIdAsync(int id)
        {
            var assessmentItem = await _assessmentItemRepository.GetByIdAsync(id);
            if (assessmentItem == null) return null;

            return new AssessmentItemDetailResponse
            {
                Id = assessmentItem.Id,
                EvaluationSchemeId = assessmentItem.EvaluationSchemeId,
                EvaluationSchemeName = assessmentItem.EvaluationScheme.Name,
                EvaluationSchemeTotalMarks = assessmentItem.EvaluationScheme.TotalMarks,
                CourseOfferingId = assessmentItem.EvaluationScheme.CourseOfferingId,
                SubjectCode = assessmentItem.EvaluationScheme.CourseOffering.Subject.Code,
                SubjectName = assessmentItem.EvaluationScheme.CourseOffering.Subject.Name,
                BatchName = assessmentItem.EvaluationScheme.CourseOffering.Batch.Name,
                SubjectUnitId = assessmentItem.SubjectUnitId,
                SubjectUnitTopicName = assessmentItem.SubjectUnit?.TopicName,
                SubjectUnitNumber = assessmentItem.SubjectUnit?.UnitNumber,
                Name = assessmentItem.Name,
                Description = assessmentItem.Description,
                MaxMarks = assessmentItem.MaxMarks,
                CalculationType = assessmentItem.CalculationType,
                Weight = assessmentItem.Weight,
                ScheduledDate = assessmentItem.ScheduledDate,
                DueDate = assessmentItem.DueDate,
                CreatedBy = assessmentItem.CreatedBy,
                CreatedByName = assessmentItem.CreatedByNavigation?.IdNavigation.FullName,
                CreatedByEmployeeId = assessmentItem.CreatedByNavigation?.EmployeeId,
                IsActive = assessmentItem.IsActive,
                CreatedAt = assessmentItem.CreatedAt,
                UpdatedAt = assessmentItem.UpdatedAt,
                DeletedAt = assessmentItem.DeletedAt,
                StudentMarksCount = await _assessmentItemRepository.GetStudentMarksCountAsync(id),
                UploadHistoriesCount = await _assessmentItemRepository.GetUploadHistoriesCountAsync(id)
            };
        }

        public async Task<AssessmentItemResponse> CreateAsync(CreateAssessmentItemRequest request)
        {
            // Validate EvaluationScheme exists
            var evaluationScheme = await _evaluationSchemeRepository.GetByIdAsync(request.EvaluationSchemeId);
            if (evaluationScheme == null)
                throw new KeyNotFoundException("Evaluation scheme not found");

            if (!evaluationScheme.IsActive)
                throw new InvalidOperationException("Evaluation scheme is not active");

            // Validate SubjectUnit exists if provided
            if (request.SubjectUnitId.HasValue)
            {
                var subjectUnit = await _subjectUnitRepository.GetByIdAsync(request.SubjectUnitId.Value);
                if (subjectUnit == null)
                    throw new KeyNotFoundException("Subject unit not found");

                // Validate SubjectUnit belongs to the same subject as the course offering
                var courseOfferingSubjectId = evaluationScheme.CourseOffering.SubjectId;
                if (subjectUnit.SubjectId != courseOfferingSubjectId)
                {
                    throw new InvalidOperationException(
                        "Subject unit must belong to the same subject as the course offering");
                }
            }

            // Validate CreatedBy faculty if provided
            if (request.CreatedBy.HasValue &&
                !await _facultyRepository.ExistsAsync(request.CreatedBy.Value))
            {
                throw new KeyNotFoundException("Faculty (CreatedBy) not found");
            }

            // Validate MaxMarks doesn't exceed EvaluationScheme TotalMarks
            if (request.MaxMarks > evaluationScheme.TotalMarks)
            {
                _logger.LogWarning(
                    "Assessment item max marks ({MaxMarks}) exceeds evaluation scheme total marks ({TotalMarks})",
                    request.MaxMarks, evaluationScheme.TotalMarks);
            }

            var assessmentItem = new AssessmentItem
            {
                EvaluationSchemeId = request.EvaluationSchemeId,
                SubjectUnitId = request.SubjectUnitId,
                Name = request.Name,
                Description = request.Description,
                MaxMarks = request.MaxMarks,
                CalculationType = request.CalculationType,
                Weight = request.Weight,
                ScheduledDate = request.ScheduledDate,
                DueDate = request.DueDate,
                CreatedBy = request.CreatedBy,
                IsActive = request.IsActive
            };

            await _assessmentItemRepository.CreateAsync(assessmentItem);

            // Reload with navigation properties
            assessmentItem = await _assessmentItemRepository.GetByIdAsync(assessmentItem.Id);

            return new AssessmentItemResponse
            {
                Id = assessmentItem!.Id,
                EvaluationSchemeId = assessmentItem.EvaluationSchemeId,
                EvaluationSchemeName = assessmentItem.EvaluationScheme.Name,
                SubjectCode = assessmentItem.EvaluationScheme.CourseOffering.Subject.Code,
                SubjectName = assessmentItem.EvaluationScheme.CourseOffering.Subject.Name,
                SubjectUnitId = assessmentItem.SubjectUnitId,
                SubjectUnitTopicName = assessmentItem.SubjectUnit?.TopicName,
                Name = assessmentItem.Name,
                Description = assessmentItem.Description,
                MaxMarks = assessmentItem.MaxMarks,
                CalculationType = assessmentItem.CalculationType,
                Weight = assessmentItem.Weight,
                ScheduledDate = assessmentItem.ScheduledDate,
                DueDate = assessmentItem.DueDate,
                CreatedBy = assessmentItem.CreatedBy,
                CreatedByName = assessmentItem.CreatedByNavigation?.IdNavigation.FullName,
                IsActive = assessmentItem.IsActive,
                CreatedAt = assessmentItem.CreatedAt,
                UpdatedAt = assessmentItem.UpdatedAt
            };
        }

        public async Task<AssessmentItemResponse> UpdateAsync(int id, UpdateAssessmentItemRequest request)
        {
            var assessmentItem = await _assessmentItemRepository.GetByIdAsync(id);
            if (assessmentItem == null)
                throw new KeyNotFoundException("Assessment item not found");

            // Validate SubjectUnit exists if being changed
            if (request.SubjectUnitId.HasValue)
            {
                var subjectUnit = await _subjectUnitRepository.GetByIdAsync(request.SubjectUnitId.Value);
                if (subjectUnit == null)
                    throw new KeyNotFoundException("Subject unit not found");

                // Validate SubjectUnit belongs to the same subject
                var courseOfferingSubjectId = assessmentItem.EvaluationScheme.CourseOffering.SubjectId;
                if (subjectUnit.SubjectId != courseOfferingSubjectId)
                {
                    throw new InvalidOperationException(
                        "Subject unit must belong to the same subject as the course offering");
                }
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.Name))
                assessmentItem.Name = request.Name;

            assessmentItem.Description = request.Description ?? assessmentItem.Description;

            if (request.MaxMarks.HasValue)
                assessmentItem.MaxMarks = request.MaxMarks.Value;

            if (!string.IsNullOrEmpty(request.CalculationType))
                assessmentItem.CalculationType = request.CalculationType;

            assessmentItem.Weight = request.Weight ?? assessmentItem.Weight;
            assessmentItem.ScheduledDate = request.ScheduledDate ?? assessmentItem.ScheduledDate;
            assessmentItem.DueDate = request.DueDate ?? assessmentItem.DueDate;

            // Allow setting SubjectUnitId to null
            if (request.SubjectUnitId != null)
                assessmentItem.SubjectUnitId = request.SubjectUnitId;

            if (request.IsActive.HasValue)
                assessmentItem.IsActive = request.IsActive.Value;

            await _assessmentItemRepository.UpdateAsync(assessmentItem);

            // Reload with navigation properties
            assessmentItem = await _assessmentItemRepository.GetByIdAsync(id);

            return new AssessmentItemResponse
            {
                Id = assessmentItem!.Id,
                EvaluationSchemeId = assessmentItem.EvaluationSchemeId,
                EvaluationSchemeName = assessmentItem.EvaluationScheme.Name,
                SubjectCode = assessmentItem.EvaluationScheme.CourseOffering.Subject.Code,
                SubjectName = assessmentItem.EvaluationScheme.CourseOffering.Subject.Name,
                SubjectUnitId = assessmentItem.SubjectUnitId,
                SubjectUnitTopicName = assessmentItem.SubjectUnit?.TopicName,
                Name = assessmentItem.Name,
                Description = assessmentItem.Description,
                MaxMarks = assessmentItem.MaxMarks,
                CalculationType = assessmentItem.CalculationType,
                Weight = assessmentItem.Weight,
                ScheduledDate = assessmentItem.ScheduledDate,
                DueDate = assessmentItem.DueDate,
                CreatedBy = assessmentItem.CreatedBy,
                CreatedByName = assessmentItem.CreatedByNavigation?.IdNavigation.FullName,
                IsActive = assessmentItem.IsActive,
                CreatedAt = assessmentItem.CreatedAt,
                UpdatedAt = assessmentItem.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _assessmentItemRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Assessment item not found");

            // Cascade delete student marks
            var deletedMarks = await _studentMarkRepository.DeleteByAssessmentItemIdAsync(id);
            if (deletedMarks > 0)
                _logger.LogInformation("Cascade deleted {Count} student mark(s) for assessment item {AssessmentItemId}", deletedMarks, id);

            // Check if assessment item has any upload histories (don't cascade delete, these are logs)
            var uploadHistoriesCount = await _assessmentItemRepository.GetUploadHistoriesCountAsync(id);
            if (uploadHistoriesCount > 0)
                throw new InvalidOperationException($"Cannot delete assessment item that has {uploadHistoriesCount} upload history/histories");

            return await _assessmentItemRepository.DeleteAsync(id);
        }
    }
}