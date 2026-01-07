using FluentValidation;
using GradeSense.API.DTOs.Batch.Request;

namespace GradeSense.API.Validators.Batch
{
    public class CreateBatchRequestValidator : AbstractValidator<CreateBatchRequest>
    {
        public CreateBatchRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Batch name is required")
                .MinimumLength(2).WithMessage("Batch name must be at least 2 characters")
                .MaximumLength(255).WithMessage("Batch name cannot exceed 255 characters");

            RuleFor(x => x.Semester)
                .InclusiveBetween(1, 8)
                .WithMessage("Semester must be between 1 and 8");

            RuleFor(x => x.AcademicYear)
                .InclusiveBetween(2000, DateTime.Now.Year + 1)
                .WithMessage($"Academic year must be between 2000 and {DateTime.Now.Year + 1}");

            RuleFor(x => x.DepartmentId)
                .GreaterThan(0).WithMessage("Department ID must be greater than 0");

            RuleFor(x => x.ClassCoordinatorId)
                .GreaterThan(0).WithMessage("Class coordinator ID must be greater than 0")
                .When(x => x.ClassCoordinatorId.HasValue);

            RuleFor(x => x.Division)
                .MaximumLength(10).WithMessage("Division cannot exceed 10 characters")
                .Matches(@"^[a-zA-Z0-9-]+$")
                .WithMessage("Division must contain only letters, numbers, and hyphens")
                .When(x => !string.IsNullOrEmpty(x.Division));
        }
    }
}