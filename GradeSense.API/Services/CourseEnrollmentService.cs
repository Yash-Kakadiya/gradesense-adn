using GradeSense.API.DTOs.Common;
using GradeSense.API.DTOs.CourseEnrollment.Request;
using GradeSense.API.DTOs.CourseEnrollment.Response;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;

namespace GradeSense.API.Services
{
    public class CourseEnrollmentService : ICourseEnrollmentService
    {
        private readonly ICourseEnrollmentRepository _courseEnrollmentRepository;
        private readonly ICourseOfferingRepository _courseOfferingRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IStudentMarkRepository _studentMarkRepository;
        private readonly IAttendanceRecordRepository _attendanceRecordRepository;
        private readonly IPredictionRepository _predictionRepository;
        private readonly ILogger<CourseEnrollmentService> _logger;

        public CourseEnrollmentService(
            ICourseEnrollmentRepository courseEnrollmentRepository,
            ICourseOfferingRepository courseOfferingRepository,
            IStudentRepository studentRepository,
            IStudentMarkRepository studentMarkRepository,
            IAttendanceRecordRepository attendanceRecordRepository,
            IPredictionRepository predictionRepository,
            ILogger<CourseEnrollmentService> logger)
        {
            _courseEnrollmentRepository = courseEnrollmentRepository;
            _courseOfferingRepository = courseOfferingRepository;
            _studentRepository = studentRepository;
            _studentMarkRepository = studentMarkRepository;
            _attendanceRecordRepository = attendanceRecordRepository;
            _predictionRepository = predictionRepository;
            _logger = logger;
        }

        public async Task<PagedResponse<CourseEnrollmentListResponse>> GetAllAsync(CourseEnrollmentFilterRequest filter)
        {
            var (courseEnrollments, total) = await _courseEnrollmentRepository.GetAllAsync(filter);

            var data = courseEnrollments.Select(ce => new CourseEnrollmentListResponse
            {
                Id = ce.Id,
                StudentId = ce.StudentId,
                CourseOfferingId = ce.CourseOfferingId,
                SubjectCode = ce.CourseOffering.Subject.Code,
                SubjectName = ce.CourseOffering.Subject.Name,
                BatchName = ce.CourseOffering.Batch.Name,
                StudentName = ce.Student.IdNavigation.FullName,
                EnrollmentNumber = ce.Student.EnrollmentNumber,
                RollNumber = ce.RollNumber,
                PersonalEmail = ce.Student.IdNavigation.PersonalEmail,
                PhoneNumber = ce.Student.IdNavigation.PhoneNumber,
                EnrollmentDate = ce.EnrollmentDate,
                Status = ce.Status,
                AttendancePercentage = ce.AttendancePercentage,
                Grade = ce.Grade,
                CreatedAt = ce.CreatedAt
            }).ToList();

            return new PagedResponse<CourseEnrollmentListResponse>(
                data,
                filter.PageNumber,
                filter.PageSize,
                total
            );
        }

        public async Task<CourseEnrollmentDetailResponse?> GetByIdAsync(int id)
        {
            var courseEnrollment = await _courseEnrollmentRepository.GetByIdAsync(id);
            if (courseEnrollment == null) return null;

            return new CourseEnrollmentDetailResponse
            {
                Id = courseEnrollment.Id,
                CourseOfferingId = courseEnrollment.CourseOfferingId,
                SubjectCode = courseEnrollment.CourseOffering.Subject.Code,
                SubjectName = courseEnrollment.CourseOffering.Subject.Name,
                SubjectCredit = courseEnrollment.CourseOffering.Subject.Credit,
                BatchName = courseEnrollment.CourseOffering.Batch.Name,
                BatchSemester = courseEnrollment.CourseOffering.Batch.Semester,
                DepartmentName = courseEnrollment.CourseOffering.Subject.Department.Name,
                AcademicYear = courseEnrollment.CourseOffering.AcademicYear,
                StudentId = courseEnrollment.StudentId,
                StudentName = courseEnrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = courseEnrollment.Student.EnrollmentNumber,
                StudentEmail = courseEnrollment.Student.IdNavigation.PersonalEmail,
                RollNumber = courseEnrollment.RollNumber,
                EnrollmentDate = courseEnrollment.EnrollmentDate,
                Status = courseEnrollment.Status,
                AttendancePercentage = courseEnrollment.AttendancePercentage,
                Grade = courseEnrollment.Grade,
                GradePoints = courseEnrollment.GradePoints,
                CreatedAt = courseEnrollment.CreatedAt,
                UpdatedAt = courseEnrollment.UpdatedAt,
                DeletedAt = courseEnrollment.DeletedAt,
                StudentMarksCount = await _courseEnrollmentRepository.GetStudentMarksCountAsync(id),
                AttendanceRecordsCount = await _courseEnrollmentRepository.GetAttendanceRecordsCountAsync(id),
                PredictionsCount = await _courseEnrollmentRepository.GetPredictionsCountAsync(id)
            };
        }

        public async Task<CourseEnrollmentResponse> CreateAsync(CreateCourseEnrollmentRequest request)
        {
            // Validate CourseOffering exists
            var courseOffering = await _courseOfferingRepository.GetByIdAsync(request.CourseOfferingId);
            if (courseOffering == null)
                throw new KeyNotFoundException("Course offering not found");

            if (!courseOffering.IsActive)
                throw new InvalidOperationException("Course offering is not active");

            // Validate Student exists
            var student = await _studentRepository.GetByIdAsync(request.StudentId);
            if (student == null)
                throw new KeyNotFoundException("Student not found");

            if (student.Status != "Active")
                throw new InvalidOperationException("Student is not active");

            // Check if student already enrolled in this course
            if (await _courseEnrollmentRepository.StudentAlreadyEnrolledAsync(request.CourseOfferingId, request.StudentId))
                throw new InvalidOperationException("Student is already enrolled in this course offering");

            // Validate RollNumber uniqueness per course if provided
            if (!string.IsNullOrEmpty(request.RollNumber) &&
                await _courseEnrollmentRepository.RollNumberExistsForCourseAsync(request.CourseOfferingId, request.RollNumber))
            {
                throw new InvalidOperationException($"Roll number '{request.RollNumber}' already exists for this course offering");
            }

            // Check max enrollment limit
            if (courseOffering.MaxEnrollment.HasValue)
            {
                var currentEnrollments = await _courseOfferingRepository.GetActiveEnrollmentsCountAsync(request.CourseOfferingId);
                if (currentEnrollments >= courseOffering.MaxEnrollment.Value)
                {
                    throw new InvalidOperationException($"Course offering has reached maximum enrollment limit of {courseOffering.MaxEnrollment.Value}");
                }
            }

            var courseEnrollment = new CourseEnrollment
            {
                CourseOfferingId = request.CourseOfferingId,
                StudentId = request.StudentId,
                RollNumber = request.RollNumber,
                EnrollmentDate = request.EnrollmentDate ?? DateTime.Now,
                Status = request.Status,
                AttendancePercentage = request.AttendancePercentage,
                Grade = request.Grade,
                GradePoints = request.GradePoints
            };

            await _courseEnrollmentRepository.CreateAsync(courseEnrollment);

            // Reload with navigation properties
            courseEnrollment = await _courseEnrollmentRepository.GetByIdAsync(courseEnrollment.Id);

            return new CourseEnrollmentResponse
            {
                Id = courseEnrollment!.Id,
                CourseOfferingId = courseEnrollment.CourseOfferingId,
                SubjectCode = courseEnrollment.CourseOffering.Subject.Code,
                SubjectName = courseEnrollment.CourseOffering.Subject.Name,
                BatchName = courseEnrollment.CourseOffering.Batch.Name,
                StudentId = courseEnrollment.StudentId,
                StudentName = courseEnrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = courseEnrollment.Student.EnrollmentNumber,
                RollNumber = courseEnrollment.RollNumber,
                PersonalEmail = courseEnrollment.Student.IdNavigation.PersonalEmail,
                PhoneNumber = courseEnrollment.Student.IdNavigation.PhoneNumber,
                EnrollmentDate = courseEnrollment.EnrollmentDate,
                Status = courseEnrollment.Status,
                AttendancePercentage = courseEnrollment.AttendancePercentage,
                Grade = courseEnrollment.Grade,
                GradePoints = courseEnrollment.GradePoints,
                CreatedAt = courseEnrollment.CreatedAt,
                UpdatedAt = courseEnrollment.UpdatedAt
            };
        }

        public async Task<CourseEnrollmentResponse> UpdateAsync(int id, UpdateCourseEnrollmentRequest request)
        {
            var courseEnrollment = await _courseEnrollmentRepository.GetByIdAsync(id);
            if (courseEnrollment == null)
                throw new KeyNotFoundException("Course enrollment not found");

            // Validate RollNumber uniqueness if being changed
            if (!string.IsNullOrEmpty(request.RollNumber) &&
                request.RollNumber != courseEnrollment.RollNumber &&
                await _courseEnrollmentRepository.RollNumberExistsForCourseAsync(
                    courseEnrollment.CourseOfferingId, request.RollNumber, id))
            {
                throw new InvalidOperationException($"Roll number '{request.RollNumber}' already exists for this course offering");
            }

            // Update fields if provided
            courseEnrollment.RollNumber = request.RollNumber ?? courseEnrollment.RollNumber;

            if (!string.IsNullOrEmpty(request.Status))
                courseEnrollment.Status = request.Status;

            courseEnrollment.AttendancePercentage = request.AttendancePercentage ?? courseEnrollment.AttendancePercentage;
            courseEnrollment.Grade = request.Grade ?? courseEnrollment.Grade;
            courseEnrollment.GradePoints = request.GradePoints ?? courseEnrollment.GradePoints;

            await _courseEnrollmentRepository.UpdateAsync(courseEnrollment);

            // Reload with navigation properties
            courseEnrollment = await _courseEnrollmentRepository.GetByIdAsync(id);

            return new CourseEnrollmentResponse
            {
                Id = courseEnrollment!.Id,
                CourseOfferingId = courseEnrollment.CourseOfferingId,
                SubjectCode = courseEnrollment.CourseOffering.Subject.Code,
                SubjectName = courseEnrollment.CourseOffering.Subject.Name,
                BatchName = courseEnrollment.CourseOffering.Batch.Name,
                StudentId = courseEnrollment.StudentId,
                StudentName = courseEnrollment.Student.IdNavigation.FullName,
                EnrollmentNumber = courseEnrollment.Student.EnrollmentNumber,
                RollNumber = courseEnrollment.RollNumber,
                PersonalEmail = courseEnrollment.Student.IdNavigation.PersonalEmail,
                PhoneNumber = courseEnrollment.Student.IdNavigation.PhoneNumber,
                EnrollmentDate = courseEnrollment.EnrollmentDate,
                Status = courseEnrollment.Status,
                AttendancePercentage = courseEnrollment.AttendancePercentage,
                Grade = courseEnrollment.Grade,
                GradePoints = courseEnrollment.GradePoints,
                CreatedAt = courseEnrollment.CreatedAt,
                UpdatedAt = courseEnrollment.UpdatedAt
            };
        }

        public async Task<BulkEnrollResponse> BulkEnrollAsync(BulkEnrollRequest request)
        {
            var response = new BulkEnrollResponse
            {
                TotalRequested = request.StudentIds.Count
            };

            // Validate CourseOffering exists
            var courseOffering = await _courseOfferingRepository.GetByIdAsync(request.CourseOfferingId);
            if (courseOffering == null)
            {
                response.Errors.Add("Course offering not found");
                response.FailedEnrollments = request.StudentIds.Count;
                return response;
            }

            if (!courseOffering.IsActive)
            {
                response.Errors.Add("Course offering is not active");
                response.FailedEnrollments = request.StudentIds.Count;
                return response;
            }

            foreach (var studentId in request.StudentIds)
            {
                try
                {
                    // Check if student exists
                    if (!await _studentRepository.ExistsAsync(studentId))
                    {
                        response.Errors.Add($"Student ID {studentId} not found");
                        response.FailedEnrollments++;
                        continue;
                    }

                    // Check if student already enrolled
                    if (await _courseEnrollmentRepository.StudentAlreadyEnrolledAsync(request.CourseOfferingId, studentId))
                    {
                        response.Errors.Add($"Student ID {studentId} already enrolled");
                        response.FailedEnrollments++;
                        continue;
                    }

                    // Create enrollment
                    var enrollment = new CourseEnrollment
                    {
                        CourseOfferingId = request.CourseOfferingId,
                        StudentId = studentId,
                        EnrollmentDate = DateTime.Now,
                        Status = "Active"
                    };

                    await _courseEnrollmentRepository.CreateAsync(enrollment);
                    response.SuccessfulEnrollments++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error enrolling student {StudentId}", studentId);
                    response.Errors.Add($"Error enrolling student ID {studentId}: {ex.Message}");
                    response.FailedEnrollments++;
                }
            }

            return response;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            if (!await _courseEnrollmentRepository.ExistsAsync(id))
                throw new KeyNotFoundException("Course enrollment not found");

            // Cascade delete student marks
            var deletedMarks = await _studentMarkRepository.DeleteByEnrollmentIdAsync(id);
            if (deletedMarks > 0)
                _logger.LogInformation("Cascade deleted {Count} student mark(s) for enrollment {EnrollmentId}", deletedMarks, id);

            // Cascade delete attendance records
            var deletedAttendance = await _attendanceRecordRepository.DeleteByEnrollmentIdAsync(id);
            if (deletedAttendance > 0)
                _logger.LogInformation("Cascade deleted {Count} attendance record(s) for enrollment {EnrollmentId}", deletedAttendance, id);

            // Cascade delete predictions
            var deletedPredictions = await _predictionRepository.DeleteByEnrollmentIdAsync(id);
            if (deletedPredictions > 0)
                _logger.LogInformation("Cascade deleted {Count} prediction(s) for enrollment {EnrollmentId}", deletedPredictions, id);

            return await _courseEnrollmentRepository.DeleteAsync(id);
        }
    }
}