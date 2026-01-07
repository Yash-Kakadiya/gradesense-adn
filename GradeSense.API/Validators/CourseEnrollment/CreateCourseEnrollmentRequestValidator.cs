using FluentValidation;
using GradeSense.API.DTOs.CourseEnrollment.Request;

namespace GradeSense.API.Validators.CourseEnrollment
{
    public class CreateCourseEnrollmentRequestValidator : AbstractValidator<CreateCourseEnrollmentRequest>
    {
        public CreateCourseEnrollmentRequestValidator()
        {
            RuleFor(x => x.CourseOfferingId)
                .GreaterThan(0).WithMessage("Course offering ID must be greater than 0");

            RuleFor(x => x.StudentId)
                .GreaterThan(0).WithMessage("Student ID must be greater than 0");

            RuleFor(x => x.RollNumber)
                .MaximumLength(255).WithMessage("Roll number cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.RollNumber));

            RuleFor(x => x.EnrollmentDate)
                .LessThanOrEqualTo(DateTime.Now)
                .WithMessage("Enrollment date cannot be in the future")
                .When(x => x.EnrollmentDate.HasValue);

            RuleFor(x => x.Status)
                .NotEmpty().WithMessage("Status is required")
                .Must(BeValidStatus).WithMessage("Status must be Active, Completed, Dropped, or Withdrawn");

            RuleFor(x => x.AttendancePercentage)
                .InclusiveBetween(0m, 100m)
                .WithMessage("Attendance percentage must be between 0 and 100")
                .PrecisionScale(5, 2, true)
                .WithMessage("Attendance percentage must have at most 2 decimal places")
                .When(x => x.AttendancePercentage.HasValue);

            RuleFor(x => x.Grade)
                .MaximumLength(5).WithMessage("Grade cannot exceed 5 characters")
                .Matches(@"^[A-F][+-]?$|^[A-F]$")
                .WithMessage("Grade must be in format: A+, A, A-, B+, B, B-, C+, C, C-, D, F")
                .When(x => !string.IsNullOrEmpty(x.Grade));

            RuleFor(x => x.GradePoints)
                .InclusiveBetween(0m, 10m)
                .WithMessage("Grade points must be between 0 and 10")
                .PrecisionScale(4, 2, true)
                .WithMessage("Grade points must have at most 2 decimal places")
                .When(x => x.GradePoints.HasValue);
        }

        private bool BeValidStatus(string status)
        {
            var validStatuses = new[] { "Active", "Completed", "Dropped", "Withdrawn" };
            return validStatuses.Contains(status);
        }
    }
}