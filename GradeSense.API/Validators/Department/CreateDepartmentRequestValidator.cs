using FluentValidation;
using GradeSense.API.DTOs.Department.Request;

namespace GradeSense.API.Validators.Department
{
    public class CreateDepartmentRequestValidator : AbstractValidator<CreateDepartmentRequest>
    {
        public CreateDepartmentRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Department name is required")
                .MinimumLength(2).WithMessage("Department name must be at least 2 characters")
                .MaximumLength(255).WithMessage("Department name cannot exceed 255 characters");

            RuleFor(x => x.Code)
                .MaximumLength(50).WithMessage("Department code cannot exceed 50 characters")
                .Matches(@"^[A-Z0-9]+$")
                .WithMessage("Department code must contain only uppercase letters and numbers")
                .When(x => !string.IsNullOrEmpty(x.Code));

            RuleFor(x => x.HODUserId)
                .GreaterThan(0)
                .When(x => x.HODUserId.HasValue);
        }
    }

}
