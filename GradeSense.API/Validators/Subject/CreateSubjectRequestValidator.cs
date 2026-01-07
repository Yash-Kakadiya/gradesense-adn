using FluentValidation;
using GradeSense.API.DTOs.Subject.Request;

namespace GradeSense.API.Validators.Subject
{
    public class CreateSubjectRequestValidator : AbstractValidator<CreateSubjectRequest>
    {
        public CreateSubjectRequestValidator()
        {
            RuleFor(x => x.Code)
                .NotEmpty().WithMessage("Subject code is required")
                .MaximumLength(255).WithMessage("Subject code cannot exceed 255 characters")
                .Matches(@"^[A-Z0-9-]+$")
                .WithMessage("Subject code must contain only uppercase letters, numbers, and hyphens");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Subject name is required")
                .MinimumLength(2).WithMessage("Subject name must be at least 2 characters")
                .MaximumLength(255).WithMessage("Subject name cannot exceed 255 characters");

            RuleFor(x => x.Credit)
                .InclusiveBetween(0m, 99.9m)
                .WithMessage("Credit must be between 0.0 and 99.9")
                .PrecisionScale(3, 1, true)
                .WithMessage("Credit must have at most 1 decimal place");

            RuleFor(x => x.DepartmentId)
                .GreaterThan(0).WithMessage("Department ID must be greater than 0");

            RuleFor(x => x.Semester)
                .InclusiveBetween(1, 8)
                .WithMessage("Semester must be between 1 and 8")
                .When(x => x.Semester.HasValue);

            RuleFor(x => x.SubjectType)
                .MaximumLength(50).WithMessage("Subject type cannot exceed 50 characters")
                .When(x => !string.IsNullOrEmpty(x.SubjectType));

            RuleFor(x => x.PrerequisiteSubjectId)
                .GreaterThan(0).WithMessage("Prerequisite subject ID must be greater than 0")
                .When(x => x.PrerequisiteSubjectId.HasValue);

            RuleFor(x => x.Description)
                .MaximumLength(5000).WithMessage("Description cannot exceed 5000 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.Syllabus)
                .MaximumLength(10000).WithMessage("Syllabus cannot exceed 10000 characters")
                .When(x => !string.IsNullOrEmpty(x.Syllabus));
        }
    }
}