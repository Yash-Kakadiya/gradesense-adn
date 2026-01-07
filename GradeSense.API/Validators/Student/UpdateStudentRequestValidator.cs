using FluentValidation;
using GradeSense.API.DTOs.Student.Request;

namespace GradeSense.API.Validators.Student
{
    public class UpdateStudentRequestValidator : AbstractValidator<UpdateStudentRequest>
    {
        public UpdateStudentRequestValidator()
        {
            RuleFor(x => x.EnrollmentNumber)
                .MaximumLength(255).WithMessage("Enrollment number cannot exceed 255 characters")
                .Matches(@"^[A-Z0-9-]+$")
                .WithMessage("Enrollment number must contain only uppercase letters, numbers, and hyphens")
                .When(x => !string.IsNullOrEmpty(x.EnrollmentNumber));

            RuleFor(x => x.AdmissionYear)
                .InclusiveBetween(2000, DateTime.Now.Year + 1)
                .WithMessage($"Admission year must be between 2000 and {DateTime.Now.Year + 1}")
                .When(x => x.AdmissionYear.HasValue);

            RuleFor(x => x.CurrentSemester)
                .InclusiveBetween(1, 8)
                .WithMessage("Current semester must be between 1 and 8")
                .When(x => x.CurrentSemester.HasValue);

            RuleFor(x => x.DepartmentId)
                .GreaterThan(0).WithMessage("Department ID must be greater than 0")
                .When(x => x.DepartmentId.HasValue);

            RuleFor(x => x.Status)
                .Must(BeValidStatus).WithMessage("Status must be Active, Suspended, Graduated, or Dropped")
                .When(x => !string.IsNullOrEmpty(x.Status));

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