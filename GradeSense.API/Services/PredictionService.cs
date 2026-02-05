using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.Prediction.Request;
using GradeSense.API.DTOs.Prediction.Response;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class PredictionService : IPredictionService
    {
        private readonly IPredictionRepository _predictionRepository;
        private readonly ICourseEnrollmentRepository _courseEnrollmentRepository;
        private readonly IFacultyRepository _facultyRepository;
        private readonly ILogger<PredictionService> _logger;

        public PredictionService(
            IPredictionRepository predictionRepository,
            ICourseEnrollmentRepository courseEnrollmentRepository,
            IFacultyRepository facultyRepository,
            ILogger<PredictionService> logger)
        {
            _predictionRepository = predictionRepository;
            _courseEnrollmentRepository = courseEnrollmentRepository;
            _facultyRepository = facultyRepository;
            _logger = logger;
        }

        public async Task<PagedResponse<PredictionListResponse>> GetAllAsync(PredictionFilterRequest filter)
        {
            var (predictions, total) = await _predictionRepository.GetAllAsync(filter);
            var now = DateTime.Now;

            var data = predictions.Select(p => new PredictionListResponse
            {
                Id = p.Id,
                StudentName = p.CourseEnrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = p.CourseEnrollment.Student.EnrollmentNumber,
                SubjectCode = p.CourseEnrollment.CourseOffering.Subject.Code,
                SubjectName = p.CourseEnrollment.CourseOffering.Subject.Name,
                PredictedCategory = p.PredictedCategory,
                RiskScore = p.RiskScore,
                ConfidenceScore = p.ConfidenceScore,
                PredictedGrade = p.PredictedGrade,
                IsActive = p.IsActive,
                IsExpired = p.ExpiresAt.HasValue && p.ExpiresAt.Value < now,
                GeneratedAt = p.GeneratedAt,
                CreatedAt = p.CreatedAt
            }).ToList();

            return new PagedResponse<PredictionListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<PredictionDetailResponse?> GetByIdAsync(string id)
        {
            var prediction = await _predictionRepository.GetByIdAsync(id);
            if (prediction == null) return null;

            return new PredictionDetailResponse
            {
                Id = prediction.Id,
                CourseEnrollmentId = prediction.CourseEnrollmentId,
                StudentName = prediction.CourseEnrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = prediction.CourseEnrollment.Student.EnrollmentNumber,
                StudentEmail = prediction.CourseEnrollment.Student.IdNavigation.PersonalEmail,
                SubjectCode = prediction.CourseEnrollment.CourseOffering.Subject.Code,
                SubjectName = prediction.CourseEnrollment.CourseOffering.Subject.Name,
                BatchName = prediction.CourseEnrollment.CourseOffering.Batch.Name,
                DepartmentName = prediction.CourseEnrollment.CourseOffering.Subject.Department.Name,
                PredictedCategory = prediction.PredictedCategory,
                RiskScore = prediction.RiskScore,
                ConfidenceScore = prediction.ConfidenceScore,
                PredictedGrade = prediction.PredictedGrade,
                PredictedMarks = prediction.PredictedMarks,
                ModelVersion = prediction.ModelVersion,
                ModelAccuracy = prediction.ModelAccuracy,
                FeatureImportance = prediction.FeatureImportance,
                ExplanationJson = prediction.ExplanationJson,
                RecommendedActions = prediction.RecommendedActions,
                GeneratedAt = prediction.GeneratedAt,
                ExpiresAt = prediction.ExpiresAt,
                IsActive = prediction.IsActive,
                ReviewedBy = prediction.ReviewedBy,
                ReviewedByName = prediction.ReviewedByNavigation?.IdNavigation.FullName,
                ReviewedByEmail = prediction.ReviewedByNavigation?.IdNavigation.PersonalEmail,
                ReviewedAt = prediction.ReviewedAt,
                ReviewNotes = prediction.ReviewNotes,
                CreatedAt = prediction.CreatedAt,
                UpdatedAt = prediction.UpdatedAt,
                DeletedAt = prediction.DeletedAt
            };
        }

        public async Task<PredictionResponse> CreateAsync(CreatePredictionRequest request)
        {
            // Validate CourseEnrollment exists
            if (!await _courseEnrollmentRepository.ExistsAsync(request.CourseEnrollmentId))
                throw new KeyNotFoundException("Course enrollment not found");

            // Generate GUID for Id
            var predictionId = Guid.NewGuid().ToString();

            var prediction = new Prediction
            {
                Id = predictionId,
                CourseEnrollmentId = request.CourseEnrollmentId,
                PredictedCategory = request.PredictedCategory,
                RiskScore = request.RiskScore,
                ConfidenceScore = request.ConfidenceScore,
                PredictedGrade = request.PredictedGrade,
                PredictedMarks = request.PredictedMarks,
                ModelVersion = request.ModelVersion,
                ModelAccuracy = request.ModelAccuracy,
                FeatureImportance = request.FeatureImportance,
                ExplanationJson = request.ExplanationJson,
                RecommendedActions = request.RecommendedActions,
                GeneratedAt = request.GeneratedAt ?? DateTime.Now,
                ExpiresAt = request.ExpiresAt,
                IsActive = request.IsActive
            };

            await _predictionRepository.CreateAsync(prediction);

            // Reload with navigation properties
            prediction = await _predictionRepository.GetByIdAsync(predictionId);

            return new PredictionResponse
            {
                Id = prediction!.Id,
                CourseEnrollmentId = prediction.CourseEnrollmentId,
                StudentName = prediction.CourseEnrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = prediction.CourseEnrollment.Student.EnrollmentNumber,
                SubjectCode = prediction.CourseEnrollment.CourseOffering.Subject.Code,
                SubjectName = prediction.CourseEnrollment.CourseOffering.Subject.Name,
                PredictedCategory = prediction.PredictedCategory,
                RiskScore = prediction.RiskScore,
                ConfidenceScore = prediction.ConfidenceScore,
                PredictedGrade = prediction.PredictedGrade,
                PredictedMarks = prediction.PredictedMarks,
                ModelVersion = prediction.ModelVersion,
                ModelAccuracy = prediction.ModelAccuracy,
                RecommendedActions = prediction.RecommendedActions,
                GeneratedAt = prediction.GeneratedAt,
                ExpiresAt = prediction.ExpiresAt,
                IsActive = prediction.IsActive,
                ReviewedBy = prediction.ReviewedBy,
                ReviewedByName = prediction.ReviewedByNavigation?.IdNavigation.FullName,
                ReviewedAt = prediction.ReviewedAt,
                CreatedAt = prediction.CreatedAt,
                UpdatedAt = prediction.UpdatedAt
            };
        }

        public async Task<PredictionResponse> UpdateAsync(string id, UpdatePredictionRequest request)
        {
            var prediction = await _predictionRepository.GetByIdAsync(id);
            if (prediction == null)
                throw new KeyNotFoundException("Prediction not found");

            // Validate ReviewedBy if provided
            if (request.ReviewedBy.HasValue &&
                !await _facultyRepository.ExistsAsync(request.ReviewedBy.Value))
            {
                throw new KeyNotFoundException("Reviewer (Faculty) not found");
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.PredictedCategory))
                prediction.PredictedCategory = request.PredictedCategory;

            if (request.RiskScore.HasValue)
                prediction.RiskScore = request.RiskScore.Value;

            prediction.ConfidenceScore = request.ConfidenceScore ?? prediction.ConfidenceScore;
            prediction.PredictedGrade = request.PredictedGrade ?? prediction.PredictedGrade;
            prediction.PredictedMarks = request.PredictedMarks ?? prediction.PredictedMarks;
            prediction.ModelAccuracy = request.ModelAccuracy ?? prediction.ModelAccuracy;
            prediction.FeatureImportance = request.FeatureImportance ?? prediction.FeatureImportance;
            prediction.ExplanationJson = request.ExplanationJson ?? prediction.ExplanationJson;
            prediction.RecommendedActions = request.RecommendedActions ?? prediction.RecommendedActions;
            prediction.ExpiresAt = request.ExpiresAt ?? prediction.ExpiresAt;

            if (request.IsActive.HasValue)
                prediction.IsActive = request.IsActive.Value;

            // Update review information
            if (request.ReviewedBy.HasValue)
            {
                prediction.ReviewedBy = request.ReviewedBy.Value;
                prediction.ReviewedAt = request.ReviewedAt ?? DateTime.Now;
            }
            prediction.ReviewNotes = request.ReviewNotes ?? prediction.ReviewNotes;

            await _predictionRepository.UpdateAsync(prediction);

            // Reload with navigation properties
            prediction = await _predictionRepository.GetByIdAsync(id);

            return new PredictionResponse
            {
                Id = prediction!.Id,
                CourseEnrollmentId = prediction.CourseEnrollmentId,
                StudentName = prediction.CourseEnrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = prediction.CourseEnrollment.Student.EnrollmentNumber,
                SubjectCode = prediction.CourseEnrollment.CourseOffering.Subject.Code,
                SubjectName = prediction.CourseEnrollment.CourseOffering.Subject.Name,
                PredictedCategory = prediction.PredictedCategory,
                RiskScore = prediction.RiskScore,
                ConfidenceScore = prediction.ConfidenceScore,
                PredictedGrade = prediction.PredictedGrade,
                PredictedMarks = prediction.PredictedMarks,
                ModelVersion = prediction.ModelVersion,
                ModelAccuracy = prediction.ModelAccuracy,
                RecommendedActions = prediction.RecommendedActions,
                GeneratedAt = prediction.GeneratedAt,
                ExpiresAt = prediction.ExpiresAt,
                IsActive = prediction.IsActive,
                ReviewedBy = prediction.ReviewedBy,
                ReviewedByName = prediction.ReviewedByNavigation?.IdNavigation.FullName,
                ReviewedAt = prediction.ReviewedAt,
                CreatedAt = prediction.CreatedAt,
                UpdatedAt = prediction.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(string id)
        {
            if (!await _predictionRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Prediction not found");

            return await _predictionRepository.DeleteAsync(id);
        }
    }
}