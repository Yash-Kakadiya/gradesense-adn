using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.UploadHistory.Request;
using GradeSense.API.DTOs.UploadHistory.Response;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class UploadHistoryService : IUploadHistoryService
    {
        private readonly IUploadHistoryRepository _uploadHistoryRepository;
        private readonly ICourseOfferingRepository _courseOfferingRepository;
        private readonly IAssessmentItemRepository _assessmentItemRepository;
        private readonly IFacultyRepository _facultyRepository;
        private readonly ILogger<UploadHistoryService> _logger;

        public UploadHistoryService(
            IUploadHistoryRepository uploadHistoryRepository,
            ICourseOfferingRepository courseOfferingRepository,
            IAssessmentItemRepository assessmentItemRepository,
            IFacultyRepository facultyRepository,
            ILogger<UploadHistoryService> logger)
        {
            _uploadHistoryRepository = uploadHistoryRepository;
            _courseOfferingRepository = courseOfferingRepository;
            _assessmentItemRepository = assessmentItemRepository;
            _facultyRepository = facultyRepository;
            _logger = logger;
        }

        public async Task<PagedResponse<UploadHistoryListResponse>> GetAllAsync(UploadHistoryFilterRequest filter)
        {
            var (uploadHistories, total) = await _uploadHistoryRepository.GetAllAsync(filter);

            var data = uploadHistories.Select(uh => new UploadHistoryListResponse
            {
                Id = uh.Id,
                SubjectCode = uh.CourseOffering.Subject.Code,
                BatchName = uh.CourseOffering.Batch.Name,
                AssessmentItemName = uh.AssessmentItem?.Name,
                UploadedByName = uh.UploadedByNavigation.IdNavigation.FullName,
                FileName = uh.FileName,
                SuccessCount = uh.SuccessCount,
                ErrorCount = uh.ErrorCount,
                TotalCount = uh.TotalCount,
                Status = uh.Status,
                UploadedAt = uh.UploadedAt
            }).ToList();

            return new PagedResponse<UploadHistoryListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<UploadHistoryDetailResponse?> GetByIdAsync(string id)
        {
            var uploadHistory = await _uploadHistoryRepository.GetByIdAsync(id);
            if (uploadHistory == null) return null;

            return new UploadHistoryDetailResponse
            {
                Id = uploadHistory.Id,
                CourseOfferingId = uploadHistory.CourseOfferingId,
                SubjectCode = uploadHistory.CourseOffering.Subject.Code,
                SubjectName = uploadHistory.CourseOffering.Subject.Name,
                SubjectCredit = uploadHistory.CourseOffering.Subject.Credit,
                BatchName = uploadHistory.CourseOffering.Batch.Name,
                BatchSemester = uploadHistory.CourseOffering.Batch.Semester,
                DepartmentName = uploadHistory.CourseOffering.Subject.Department.Name,
                AcademicYear = uploadHistory.CourseOffering.AcademicYear,
                AssessmentItemId = uploadHistory.AssessmentItemId,
                AssessmentItemName = uploadHistory.AssessmentItem?.Name,
                UploadedBy = uploadHistory.UploadedBy,
                UploadedByName = uploadHistory.UploadedByNavigation.IdNavigation.FullName,
                UploadedByEmployeeId = uploadHistory.UploadedByNavigation.EmployeeId,
                FileName = uploadHistory.FileName,
                FileSize = uploadHistory.FileSize,
                SuccessCount = uploadHistory.SuccessCount,
                ErrorCount = uploadHistory.ErrorCount,
                TotalCount = uploadHistory.TotalCount,
                ErrorDetails = uploadHistory.ErrorDetails,
                RowDataBlob = uploadHistory.RowDataBlob,
                Status = uploadHistory.Status,
                UploadedAt = uploadHistory.UploadedAt,
                CompletedAt = uploadHistory.CompletedAt,
                CreatedAt = uploadHistory.CreatedAt,
                UpdatedAt = uploadHistory.UpdatedAt,
                DeletedAt = uploadHistory.DeletedAt
            };
        }

        public async Task<UploadHistoryResponse> CreateAsync(CreateUploadHistoryRequest request)
        {
            // Validate CourseOffering exists
            if (!await _courseOfferingRepository.ExistsAsync(request.CourseOfferingId))
                throw new KeyNotFoundException("Course offering not found");

            // Validate AssessmentItem exists if provided
            if (request.AssessmentItemId.HasValue &&
                !await _assessmentItemRepository.ExistsAsync(request.AssessmentItemId.Value))
            {
                throw new KeyNotFoundException("Assessment item not found");
            }

            // Validate UploadedBy exists
            if (!await _facultyRepository.ExistsAsync(request.UploadedBy))
                throw new KeyNotFoundException("Faculty (UploadedBy) not found");

            // Soft validation: Check if counts add up
            if (request.SuccessCount + request.ErrorCount != request.TotalCount)
            {
                _logger.LogWarning(
                    "Upload history counts don't add up: Success={Success}, Error={Error}, Total={Total}",
                    request.SuccessCount, request.ErrorCount, request.TotalCount);
            }

            var uploadHistory = new UploadHistory
            {
                Id = Guid.NewGuid().ToString(), // Generate GUID
                CourseOfferingId = request.CourseOfferingId,
                AssessmentItemId = request.AssessmentItemId,
                UploadedBy = request.UploadedBy,
                FileName = request.FileName,
                FileSize = request.FileSize,
                SuccessCount = request.SuccessCount,
                ErrorCount = request.ErrorCount,
                TotalCount = request.TotalCount,
                ErrorDetails = request.ErrorDetails,
                RowDataBlob = request.RowDataBlob,
                Status = request.Status,
                UploadedAt = DateTime.Now
            };

            await _uploadHistoryRepository.CreateAsync(uploadHistory);

            // Reload with navigation properties
            uploadHistory = await _uploadHistoryRepository.GetByIdAsync(uploadHistory.Id);

            return new UploadHistoryResponse
            {
                Id = uploadHistory!.Id,
                CourseOfferingId = uploadHistory.CourseOfferingId,
                SubjectCode = uploadHistory.CourseOffering.Subject.Code,
                SubjectName = uploadHistory.CourseOffering.Subject.Name,
                BatchName = uploadHistory.CourseOffering.Batch.Name,
                AssessmentItemId = uploadHistory.AssessmentItemId,
                AssessmentItemName = uploadHistory.AssessmentItem?.Name,
                UploadedBy = uploadHistory.UploadedBy,
                UploadedByName = uploadHistory.UploadedByNavigation.IdNavigation.FullName,
                FileName = uploadHistory.FileName,
                FileSize = uploadHistory.FileSize,
                SuccessCount = uploadHistory.SuccessCount,
                ErrorCount = uploadHistory.ErrorCount,
                TotalCount = uploadHistory.TotalCount,
                Status = uploadHistory.Status,
                UploadedAt = uploadHistory.UploadedAt,
                CompletedAt = uploadHistory.CompletedAt,
                CreatedAt = uploadHistory.CreatedAt,
                UpdatedAt = uploadHistory.UpdatedAt
            };
        }

        public async Task<UploadHistoryResponse> UpdateAsync(string id, UpdateUploadHistoryRequest request)
        {
            var uploadHistory = await _uploadHistoryRepository.GetByIdAsync(id);
            if (uploadHistory == null)
                throw new KeyNotFoundException("Upload history not found");

            // Update fields if provided
            if (request.SuccessCount.HasValue)
                uploadHistory.SuccessCount = request.SuccessCount.Value;

            if (request.ErrorCount.HasValue)
                uploadHistory.ErrorCount = request.ErrorCount.Value;

            if (request.TotalCount.HasValue)
                uploadHistory.TotalCount = request.TotalCount.Value;

            uploadHistory.ErrorDetails = request.ErrorDetails ?? uploadHistory.ErrorDetails;
            uploadHistory.RowDataBlob = request.RowDataBlob ?? uploadHistory.RowDataBlob;

            if (!string.IsNullOrEmpty(request.Status))
                uploadHistory.Status = request.Status;

            if (request.CompletedAt.HasValue)
                uploadHistory.CompletedAt = request.CompletedAt.Value;

            // Auto-set CompletedAt if status changes to Completed or Failed
            if (!string.IsNullOrEmpty(request.Status) &&
                (request.Status == "Completed" || request.Status == "Failed") &&
                !uploadHistory.CompletedAt.HasValue)
            {
                uploadHistory.CompletedAt = DateTime.Now;
            }

            // Soft validation: Check if counts add up
            if (uploadHistory.SuccessCount + uploadHistory.ErrorCount != uploadHistory.TotalCount)
            {
                _logger.LogWarning(
                    "Upload history {UploadHistoryId} counts don't add up: Success={Success}, Error={Error}, Total={Total}",
                    id, uploadHistory.SuccessCount, uploadHistory.ErrorCount, uploadHistory.TotalCount);
            }

            await _uploadHistoryRepository.UpdateAsync(uploadHistory);

            // Reload with navigation properties
            uploadHistory = await _uploadHistoryRepository.GetByIdAsync(id);

            return new UploadHistoryResponse
            {
                Id = uploadHistory!.Id,
                CourseOfferingId = uploadHistory.CourseOfferingId,
                SubjectCode = uploadHistory.CourseOffering.Subject.Code,
                SubjectName = uploadHistory.CourseOffering.Subject.Name,
                BatchName = uploadHistory.CourseOffering.Batch.Name,
                AssessmentItemId = uploadHistory.AssessmentItemId,
                AssessmentItemName = uploadHistory.AssessmentItem?.Name,
                UploadedBy = uploadHistory.UploadedBy,
                UploadedByName = uploadHistory.UploadedByNavigation.IdNavigation.FullName,
                FileName = uploadHistory.FileName,
                FileSize = uploadHistory.FileSize,
                SuccessCount = uploadHistory.SuccessCount,
                ErrorCount = uploadHistory.ErrorCount,
                TotalCount = uploadHistory.TotalCount,
                Status = uploadHistory.Status,
                UploadedAt = uploadHistory.UploadedAt,
                CompletedAt = uploadHistory.CompletedAt,
                CreatedAt = uploadHistory.CreatedAt,
                UpdatedAt = uploadHistory.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(string id)
        {
            if (!await _uploadHistoryRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Upload history not found");

            // Optional: Prevent deletion of recent uploads
            var uploadHistory = await _uploadHistoryRepository.GetByIdAsync(id);
            if (uploadHistory != null && uploadHistory.Status == "Processing")
            {
                _logger.LogWarning(
                    "Attempting to delete upload history {UploadHistoryId} with status 'Processing'",
                    id);
            }

            return await _uploadHistoryRepository.DeleteAsync(id);
        }
    }
}