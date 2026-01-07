using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.StudentMark.Request;
using GradeSense.API.DTOs.StudentMark.Response;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class StudentMarkService : IStudentMarkService
    {
        private readonly IStudentMarkRepository _studentMarkRepository;
        private readonly ICourseEnrollmentRepository _courseEnrollmentRepository;
        private readonly IAssessmentItemRepository _assessmentItemRepository;
        private readonly IFacultyRepository _facultyRepository;
        private readonly ILogger<StudentMarkService> _logger;

        public StudentMarkService(
            IStudentMarkRepository studentMarkRepository,
            ICourseEnrollmentRepository courseEnrollmentRepository,
            IAssessmentItemRepository assessmentItemRepository,
            IFacultyRepository facultyRepository,
            ILogger<StudentMarkService> logger)
        {
            _studentMarkRepository = studentMarkRepository;
            _courseEnrollmentRepository = courseEnrollmentRepository;
            _assessmentItemRepository = assessmentItemRepository;
            _facultyRepository = facultyRepository;
            _logger = logger;
        }

        public async Task<PagedResponse<StudentMarkListResponse>> GetAllAsync(StudentMarkFilterRequest filter)
        {
            var (studentMarks, total) = await _studentMarkRepository.GetAllAsync(filter);

            var data = studentMarks.Select(sm => new StudentMarkListResponse
            {
                Id = sm.Id,
                StudentName = sm.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = sm.Enrollment.Student.EnrollmentNumber,
                AssessmentItemName = sm.AssessmentItem.Name,
                AssessmentMaxMarks = sm.AssessmentItem.MaxMarks,
                ObtainedMarks = sm.ObtainedMarks,
                IsAbsent = sm.IsAbsent,
                GraderName = sm.Grader.IdNavigation.FullName,
                GradedDate = sm.GradedDate,
                CreatedAt = sm.CreatedAt
            }).ToList();

            return new PagedResponse<StudentMarkListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<StudentMarkDetailResponse?> GetByIdAsync(int id)
        {
            var studentMark = await _studentMarkRepository.GetByIdAsync(id);
            if (studentMark == null) return null;

            // Calculate percentage
            decimal? percentage = null;
            if (studentMark.ObtainedMarks.HasValue && studentMark.AssessmentItem.MaxMarks > 0)
            {
                percentage = (studentMark.ObtainedMarks.Value / studentMark.AssessmentItem.MaxMarks) * 100;
            }

            return new StudentMarkDetailResponse
            {
                Id = studentMark.Id,
                EnrollmentId = studentMark.EnrollmentId,
                StudentId = studentMark.Enrollment.StudentId,
                StudentName = studentMark.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = studentMark.Enrollment.Student.EnrollmentNumber,
                StudentEmail = studentMark.Enrollment.Student.IdNavigation.Email,
                AssessmentItemId = studentMark.AssessmentItemId,
                AssessmentItemName = studentMark.AssessmentItem.Name,
                AssessmentCalculationType = studentMark.AssessmentItem.CalculationType,
                AssessmentMaxMarks = studentMark.AssessmentItem.MaxMarks,
                EvaluationSchemeName = studentMark.AssessmentItem.EvaluationScheme.Name,
                SubjectCode = studentMark.Enrollment.CourseOffering.Subject.Code,
                SubjectName = studentMark.Enrollment.CourseOffering.Subject.Name,
                BatchName = studentMark.Enrollment.CourseOffering.Batch.Name,
                ObtainedMarks = studentMark.ObtainedMarks,
                IsAbsent = studentMark.IsAbsent,
                Remarks = studentMark.Remarks,
                GraderId = studentMark.GraderId,
                GraderName = studentMark.Grader.IdNavigation.FullName,
                GraderEmployeeId = studentMark.Grader.EmployeeId,
                GradedDate = studentMark.GradedDate,
                SubmissionDate = studentMark.SubmissionDate,
                CreatedAt = studentMark.CreatedAt,
                UpdatedAt = studentMark.UpdatedAt,
                DeletedAt = studentMark.DeletedAt,
                Percentage = percentage
            };
        }

        public async Task<StudentMarkResponse> CreateAsync(CreateStudentMarkRequest request)
        {
            // Validate CourseEnrollment exists
            var enrollment = await _courseEnrollmentRepository.GetByIdAsync(request.EnrollmentId);
            if (enrollment == null)
                throw new KeyNotFoundException("Course enrollment not found");

            // Validate AssessmentItem exists
            var assessmentItem = await _assessmentItemRepository.GetByIdAsync(request.AssessmentItemId);
            if (assessmentItem == null)
                throw new KeyNotFoundException("Assessment item not found");

            if (!assessmentItem.IsActive)
                throw new InvalidOperationException("Assessment item is not active");

            // Critical validation: Enrollment and AssessmentItem must be from same CourseOffering
            if (enrollment.CourseOfferingId != assessmentItem.EvaluationScheme.CourseOfferingId)
            {
                throw new InvalidOperationException(
                    "Enrollment and assessment item must belong to the same course offering");
            }

            // Validate Grader exists
            if (!await _facultyRepository.ExistsAsync(request.GraderId))
                throw new KeyNotFoundException("Grader (Faculty) not found");

            // Check for duplicate mark entry
            if (await _studentMarkRepository.MarkExistsForEnrollmentAndAssessmentAsync(
                request.EnrollmentId, request.AssessmentItemId))
            {
                throw new InvalidOperationException(
                    "Mark already exists for this student and assessment item");
            }

            // Validate ObtainedMarks <= MaxMarks
            if (request.ObtainedMarks.HasValue &&
                request.ObtainedMarks.Value > assessmentItem.MaxMarks)
            {
                throw new InvalidOperationException(
                    $"Obtained marks ({request.ObtainedMarks}) cannot exceed maximum marks ({assessmentItem.MaxMarks})");
            }

            // Critical: If IsAbsent = true, ObtainedMarks must be NULL
            if (request.IsAbsent && request.ObtainedMarks.HasValue)
            {
                throw new InvalidOperationException(
                    "Obtained marks must be null when student is marked as absent");
            }

            var studentMark = new StudentMark
            {
                EnrollmentId = request.EnrollmentId,
                AssessmentItemId = request.AssessmentItemId,
                ObtainedMarks = request.ObtainedMarks,
                IsAbsent = request.IsAbsent,
                Remarks = request.Remarks,
                GraderId = request.GraderId,
                GradedDate = request.GradedDate ?? DateTime.Now,
                SubmissionDate = request.SubmissionDate
            };

            await _studentMarkRepository.CreateAsync(studentMark);

            // Reload with navigation properties
            studentMark = await _studentMarkRepository.GetByIdAsync(studentMark.Id);

            return new StudentMarkResponse
            {
                Id = studentMark!.Id,
                EnrollmentId = studentMark.EnrollmentId,
                StudentName = studentMark.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = studentMark.Enrollment.Student.EnrollmentNumber,
                AssessmentItemId = studentMark.AssessmentItemId,
                AssessmentItemName = studentMark.AssessmentItem.Name,
                AssessmentMaxMarks = studentMark.AssessmentItem.MaxMarks,
                ObtainedMarks = studentMark.ObtainedMarks,
                IsAbsent = studentMark.IsAbsent,
                Remarks = studentMark.Remarks,
                GraderId = studentMark.GraderId,
                GraderName = studentMark.Grader.IdNavigation.FullName,
                GradedDate = studentMark.GradedDate,
                SubmissionDate = studentMark.SubmissionDate,
                CreatedAt = studentMark.CreatedAt,
                UpdatedAt = studentMark.UpdatedAt
            };
        }

        public async Task<StudentMarkResponse> UpdateAsync(int id, UpdateStudentMarkRequest request)
        {
            var studentMark = await _studentMarkRepository.GetByIdAsync(id);
            if (studentMark == null)
                throw new KeyNotFoundException("Student mark not found");

            // Validate Grader if being changed
            if (request.GraderId.HasValue &&
                !await _facultyRepository.ExistsAsync(request.GraderId.Value))
            {
                throw new KeyNotFoundException("Grader (Faculty) not found");
            }

            // Validate ObtainedMarks <= MaxMarks
            var maxMarks = studentMark.AssessmentItem.MaxMarks;
            if (request.ObtainedMarks.HasValue && request.ObtainedMarks.Value > maxMarks)
            {
                throw new InvalidOperationException(
                    $"Obtained marks ({request.ObtainedMarks}) cannot exceed maximum marks ({maxMarks})");
            }

            // Critical: If IsAbsent = true, ObtainedMarks must be NULL
            var isAbsent = request.IsAbsent ?? studentMark.IsAbsent;
            var obtainedMarks = request.ObtainedMarks ?? studentMark.ObtainedMarks;

            if (isAbsent && obtainedMarks.HasValue)
            {
                throw new InvalidOperationException(
                    "Obtained marks must be null when student is marked as absent");
            }

            // Update fields if provided
            studentMark.ObtainedMarks = request.ObtainedMarks ?? studentMark.ObtainedMarks;

            if (request.IsAbsent.HasValue)
            {
                studentMark.IsAbsent = request.IsAbsent.Value;
                // If marking as absent, clear obtained marks
                if (studentMark.IsAbsent)
                    studentMark.ObtainedMarks = null;
            }

            studentMark.Remarks = request.Remarks ?? studentMark.Remarks;

            if (request.GraderId.HasValue)
                studentMark.GraderId = request.GraderId.Value;

            studentMark.GradedDate = request.GradedDate ?? studentMark.GradedDate;
            studentMark.SubmissionDate = request.SubmissionDate ?? studentMark.SubmissionDate;

            await _studentMarkRepository.UpdateAsync(studentMark);

            // Reload with navigation properties
            studentMark = await _studentMarkRepository.GetByIdAsync(id);

            return new StudentMarkResponse
            {
                Id = studentMark!.Id,
                EnrollmentId = studentMark.EnrollmentId,
                StudentName = studentMark.Enrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = studentMark.Enrollment.Student.EnrollmentNumber,
                AssessmentItemId = studentMark.AssessmentItemId,
                AssessmentItemName = studentMark.AssessmentItem.Name,
                AssessmentMaxMarks = studentMark.AssessmentItem.MaxMarks,
                ObtainedMarks = studentMark.ObtainedMarks,
                IsAbsent = studentMark.IsAbsent,
                Remarks = studentMark.Remarks,
                GraderId = studentMark.GraderId,
                GraderName = studentMark.Grader.IdNavigation.FullName,
                GradedDate = studentMark.GradedDate,
                SubmissionDate = studentMark.SubmissionDate,
                CreatedAt = studentMark.CreatedAt,
                UpdatedAt = studentMark.UpdatedAt
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _studentMarkRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Student mark not found");

            return await _studentMarkRepository.DeleteAsync(id);
        }
    }
}