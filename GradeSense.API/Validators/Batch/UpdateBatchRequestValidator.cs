using FluentValidation;
using GradeSense.API.DTOs.Batch.Request;

namespace GradeSense.API.Validators.Batch
{
    public class UpdateBatchRequestValidator : AbstractValidator<UpdateBatchRequest>
    {
        public UpdateBatchRequestValidator()
        {
            RuleFor(x => x.Name)
                .MinimumLength(2).WithMessage("Batch name must be at least 2 characters")
                .MaximumLength(255).WithMessage("Batch name cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.Name));

            RuleFor(x => x.Semester)
                .InclusiveBetween(1, 8)
                .WithMessage("Semester must be between 1 and 8")
                .When(x => x.Semester.HasValue);

            RuleFor(x => x.AcademicYear)
                .InclusiveBetween(2000, DateTime.Now.Year + 1)
                .WithMessage($"Academic year must be between 2000 and {DateTime.Now.Year + 1}")
                .When(x => x.AcademicYear.HasValue);

            RuleFor(x => x.DepartmentId)
                .GreaterThan(0).WithMessage("Department ID must be greater than 0")
                .When(x => x.DepartmentId.HasValue);

            RuleFor(x => x.ClassCoordinatorId)
                .GreaterThan(0).WithMessage("Class coordinator ID must be greater than 0")
                .When(x => x.ClassCoordinatorId.HasValue);

            RuleFor(x => x.Division)
                .MaximumLength(10).WithMessage("Division cannot exceed 10 characters")
                .Matches(@"^[A-Z0-9]+$")
                .WithMessage("Division must contain only uppercase letters and numbers")
                .When(x => !string.IsNullOrEmpty(x.Division));
        }
    }
}