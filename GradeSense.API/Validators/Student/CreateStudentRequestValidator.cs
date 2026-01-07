using FluentValidation;
using GradeSense.API.DTOs.Student.Request;

namespace GradeSense.API.Validators.Student
{
    public class CreateStudentRequestValidator : AbstractValidator<CreateStudentRequest>
    {
        public CreateStudentRequestValidator()
        {
            RuleFor(x => x.UserId)
                .GreaterThan(0).WithMessage("User ID must be greater than 0");

            RuleFor(x => x.EnrollmentNumber)
                .NotEmpty().WithMessage("Enrollment number is required")
                .MaximumLength(255).WithMessage("Enrollment number cannot exceed 255 characters")
                .Matches(@"^[A-Z0-9-]+$")
                .WithMessage("Enrollment number must contain only uppercase letters, numbers, and hyphens");

            RuleFor(x => x.AdmissionYear)
                .InclusiveBetween(2000, DateTime.Now.Year + 1)
                .WithMessage($"Admission year must be between 2000 and {DateTime.Now.Year + 1}");

            RuleFor(x => x.CurrentSemester)
                .InclusiveBetween(1, 8)
                .WithMessage("Current semester must be between 1 and 8");

            RuleFor(x => x.DepartmentId)
                .GreaterThan(0).WithMessage("Department ID must be greater than 0");

            RuleFor(x => x.Status)
                .NotEmpty().WithMessage("Status is required")
                .Must(BeValidStatus).WithMessage("Status must be Active, Suspended, Graduated, or Dropped");

            RuleFor(x => x.CGPA)
                .InclusiveBetween(0m, 10m)
                .WithMessage("CGPA must be between 0 and 10")
                .When(x => x.CGPA.HasValue);
        }

        private bool BeValidStatus(string status)
        {
            var validStatuses = new[] { "Active", "Suspended", "Graduated", "Dropped" };
            return validStatuses.Contains(status);
        }
    }
}