using FluentValidation;
using GradeSense.API.DTOs.Faculty.Request;

namespace GradeSense.API.Validators.Faculty
{
    public class UpdateFacultyRequestValidator : AbstractValidator<UpdateFacultyRequest>
    {
        public UpdateFacultyRequestValidator()
        {
            RuleFor(x => x.EmployeeId)
                .MaximumLength(255).WithMessage("Employee ID cannot exceed 255 characters")
                .Matches(@"^[A-Z0-9-]+$")
                .WithMessage("Employee ID must contain only uppercase letters, numbers, and hyphens")
                .When(x => !string.IsNullOrEmpty(x.EmployeeId));

            RuleFor(x => x.DepartmentId)
                .GreaterThan(0).WithMessage("Department ID must be greater than 0")
                .When(x => x.DepartmentId.HasValue);

            RuleFor(x => x.Designation)
                .MaximumLength(255).WithMessage("Designation cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.Designation));

            RuleFor(x => x.JoiningDate)
                .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Now))
                .WithMessage("Joining date cannot be in the future")
                .When(x => x.JoiningDate.HasValue);

            RuleFor(x => x.Qualification)
                .MaximumLength(255).WithMessage("Qualification cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.Qualification));

            RuleFor(x => x.Specialization)
                .MaximumLength(255).WithMessage("Specialization cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.Specialization));
        }
    }
}