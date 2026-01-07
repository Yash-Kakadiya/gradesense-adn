using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.EvaluationScheme.Request;
using GradeSense.API.DTOs.EvaluationScheme.Response;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class EvaluationSchemeService : IEvaluationSchemeService
    {
        private readonly IEvaluationSchemeRepository _evaluationSchemeRepository;
        private readonly ICourseOfferingRepository _courseOfferingRepository;
        private readonly ILogger<EvaluationSchemeService> _logger;

        public EvaluationSchemeService(
            IEvaluationSchemeRepository evaluationSchemeRepository,
            ICourseOfferingRepository courseOfferingRepository,
            ILogger<EvaluationSchemeService> logger)
        {
            _evaluationSchemeRepository = evaluationSchemeRepository;
            _courseOfferingRepository = courseOfferingRepository;
            _logger = logger;
        }

        public async Task<PagedResponse<EvaluationSchemeListResponse>> GetAllAsync(EvaluationSchemeFilterRequest filter)
        {
            var (evaluationSchemes, total) = await _evaluationSchemeRepository.GetAllAsync(filter);

            var data = evaluationSchemes.Select(es => new EvaluationSchemeListResponse
            {
                Id = es.Id,
                SubjectCode = es.CourseOffering.Subject.Code,
                SubjectName = es.CourseOffering.Subject.Name,
                BatchName = es.CourseOffering.Batch.Name,
                Name = es.Name,
                TotalMarks = es.TotalMarks,
                PassingMarks = es.PassingMarks,
                Weight = es.Weight,
                EvaluationType = es.EvaluationType,
                IsActive = es.IsActive,
                CreatedAt = es.CreatedAt
            }).ToList();

            return new PagedResponse<EvaluationSchemeListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<EvaluationSchemeDetailResponse?> GetByIdAsync(int id)
        {
            var evaluationScheme = await _evaluationSchemeRepository.GetByIdAsync(id);
            if (evaluationScheme == null) return null;

            return new EvaluationSchemeDetailResponse
            {
                Id = evaluationScheme.Id,
                CourseOfferingId = evaluationScheme.CourseOfferingId,
                SubjectCode = evaluationScheme.CourseOffering.Subject.Code,
                SubjectName = evaluationScheme.CourseOffering.Subject.Name,
                SubjectCredit = evaluationScheme.CourseOffering.Subject.Credit,
                BatchName = evaluationScheme.CourseOffering.Batch.Name,
                BatchSemester = evaluationScheme.CourseOffering.Batch.Semester,
                DepartmentName = evaluationScheme.CourseOffering.Subject.Department.Name,
                AcademicYear = evaluationScheme.CourseOffering.AcademicYear,
                Name = evaluationScheme.Name,
                Description = evaluationScheme.Description,
                TotalMarks = evaluationScheme.TotalMarks,
                PassingMarks = evaluationScheme.PassingMarks,
                Weight = evaluationScheme.Weight,
                EvaluationType = evaluationScheme.EvaluationType,
                IsActive = evaluationScheme.IsActive,
                CreatedAt = evaluationScheme.CreatedAt,
                UpdatedAt = evaluationScheme.UpdatedAt,
                DeletedAt = evaluationScheme.DeletedAt,
                AssessmentItemsCount = await _evaluationSchemeRepository.GetAssessmentItemsCountAsync(id)
            };
        }

        public async Task<EvaluationSchemeResponse> CreateAsync(CreateEvaluationSchemeRequest request)
        {
            // Validate CourseOffering exists
            var courseOffering = await _courseOfferingRepository.GetByIdAsync(request.CourseOfferingId);
            if (courseOffering == null)
                throw new KeyNotFoundException("Course offering not found");

            if (!courseOffering.IsActive)
                throw new InvalidOperationException("Course offering is not active");

            // Soft validation: Check if total weight exceeds 100%
            var currentTotalWeight = await _evaluationSchemeRepository.GetTotalWeightForCourseOfferingAsync(request.CourseOfferingId);
            var newTotalWeight = currentTotalWeight + request.Weight;

            if (newTotalWeight > 100)
            {
                _logger.LogWarning(
                    "Total weight for course offering {CourseOfferingId} will exceed 100% ({TotalWeight}%). " +
                    "Current: {CurrentWeight}%, Adding: {NewWeight}%",
                    request.CourseOfferingId, newTotalWeight, currentTotalWeight, request.Weight);
            }

            var evaluationScheme = new EvaluationScheme
            {
                CourseOfferingId = request.CourseOfferingId,
                Name = request.Name,
                Description = request.Description,
                TotalMarks = request.TotalMarks,
                PassingMarks = request.PassingMarks,
                Weight = request.Weight,
                EvaluationType = request.EvaluationType,
                IsActive = request.IsActive
            };

            await _evaluationSchemeRepository.CreateAsync(evaluationScheme);

            // Reload with navigation properties
            evaluationScheme = await _evaluationSchemeRepository.GetByIdAsync(evaluationScheme.Id);

            return new EvaluationSchemeResponse
            {
                Id = evaluationScheme!.Id,
                CourseOfferingId = evaluationScheme.CourseOfferingId,
                SubjectCode = evaluationScheme.CourseOffering.Subject.Code,
                SubjectName = evaluationScheme.CourseOffering.Subject.Name,
                BatchName = evaluationScheme.CourseOffering.Batch.Name,
                Name = evaluationScheme.Name,
                Description = evaluationScheme.Description,
                TotalMarks = evaluationScheme.TotalMarks,
                PassingMarks = evaluationScheme.PassingMarks,
                Weight = evaluationScheme.Weight,
                EvaluationType = evaluationScheme.EvaluationType,
                IsActive = evaluationScheme.IsActive,
                CreatedAt = evaluationScheme.CreatedAt,
                UpdatedAt = evaluationScheme.UpdatedAt
            };
        }

        public async Task<EvaluationSchemeResponse> UpdateAsync(int id, UpdateEvaluationSchemeRequest request)
        {
            var evaluationScheme = await _evaluationSchemeRepository.GetByIdAsync(id);
            if (evaluationScheme == null)
                throw new KeyNotFoundException("Evaluation scheme not found");

            // Validate PassingMarks <= TotalMarks (considering both current and updated values)
            var totalMarks = request.TotalMarks ?? evaluationScheme.TotalMarks;
            var passingMarks = request.PassingMarks ?? evaluationScheme.PassingMarks;

            if (passingMarks > totalMarks)
                throw new InvalidOperationException("Passing marks cannot exceed total marks");

            // Soft validation: Check if total weight exceeds 100%
            if (request.Weight.HasValue)
            {
                var currentTotalWeight = await _evaluationSchemeRepository.GetTotalWeightForCourseOfferingAsync(
                    evaluationScheme.CourseOfferingId, id);
                var newTotalWeight = currentTotalWeight + request.Weight.Value;

                if (newTotalWeight > 100)
                {
                    _logger.LogWarning(
                        "Total weight for course offering {CourseOfferingId} will exceed 100% ({TotalWeight}%). " +
                        "Current: {CurrentWeight}%, Adding: {NewWeight}%",
                        evaluationScheme.CourseOfferingId, newTotalWeight, currentTotalWeight, request.Weight.Value);
                }
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.Name))
                evaluationScheme.Name = request.Name;

            evaluationScheme.Description = request.Description ?? evaluationScheme.Description;

            if (request.TotalMarks.HasValue)
                evaluationScheme.TotalMarks = request.TotalMarks.Value;

            if (request.PassingMarks.HasValue)
                evaluationScheme.PassingMarks = request.PassingMarks.Value;

            if (request.Weight.HasValue)
                evaluationScheme.Weight = request.Weight.Value;

            evaluationScheme.EvaluationType = request.EvaluationType ?? evaluationScheme.EvaluationType;

            if (request.IsActive.HasValue)
                evaluationScheme.IsActive = request.IsActive.Value;

            await _evaluationSchemeRepository.UpdateAsync(evaluationScheme);

            // Reload with navigation properties
            evaluationScheme = await _evaluationSchemeRepository.GetByIdAsync(id);

            return new EvaluationSchemeResponse
            {
                Id = evaluationScheme!.Id,
                CourseOfferingId = evaluationScheme.CourseOfferingId,
                SubjectCode = evaluationScheme.CourseOffering.Subject.Code,
                SubjectName = evaluationScheme.CourseOffering.Subject.Name,
                BatchName = evaluationScheme.CourseOffering.Batch.Name,
                Name = evaluationScheme.Name,
                Description = evaluationScheme.Description,
                TotalMarks = evaluationScheme.TotalMarks,
                PassingMarks = evaluationScheme.PassingMarks,
                Weight = evaluationScheme.Weight,
                EvaluationType = evaluationScheme.EvaluationType,
                IsActive = evaluationScheme.IsActive,
                CreatedAt = evaluationScheme.CreatedAt,
                UpdatedAt = evaluationScheme.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _evaluationSchemeRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Evaluation scheme not found");

            // Check if evaluation scheme has any assessment items
            var assessmentItemsCount = await _evaluationSchemeRepository.GetAssessmentItemsCountAsync(id);
            if (assessmentItemsCount > 0)
                throw new InvalidOperationException($"Cannot delete evaluation scheme that has {assessmentItemsCount} assessment item(s)");

            return await _evaluationSchemeRepository.DeleteAsync(id);
        }
    }
}