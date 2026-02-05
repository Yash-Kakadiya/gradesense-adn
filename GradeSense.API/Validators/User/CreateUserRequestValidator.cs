using GradeSense.API.Interfaces.Repositories;
using FluentValidation;
using GradeSense.API.DTOs.User.Request;

namespace GradeSense.API.Validators.User
{
    public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
    {
        public CreateUserRequestValidator()
        {
            RuleFor(x => x.PersonalEmail)
                .NotEmpty().WithMessage("Personal email is required")
                .EmailAddress().WithMessage("Invalid personal email format")
                .MaximumLength(255).WithMessage("Personal email cannot exceed 255 characters");

            RuleFor(x => x.InstitutionalEmail)
                .EmailAddress().WithMessage("Invalid institutional email format")
                .MaximumLength(255).WithMessage("Institutional email cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.InstitutionalEmail));

            RuleFor(x => x.PhoneNumber)
                .Matches(@"^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$")
                .WithMessage("Invalid phone number format")
                .MaximumLength(20).WithMessage("Phone number cannot exceed 20 characters")
                .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters")
                .MaximumLength(100).WithMessage("Password cannot exceed 100 characters")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter")
                .Matches(@"[0-9]").WithMessage("Password must contain at least one number")
                .Matches(@"[@$!%*?&#]").WithMessage("Password must contain at least one special character (@$!%*?&#)");

            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required")
                .MinimumLength(2).WithMessage("Full name must be at least 2 characters")
                .MaximumLength(255).WithMessage("Full name cannot exceed 255 characters")
                .Matches(@"^[a-zA-Z\s.'-]+$")
                .WithMessage("Full name can only contain letters, spaces, dots, hyphens and apostrophes");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Role is required")
                .Must(BeValidRole).WithMessage("Role must be Student, Faculty, or Admin");
        }

        private bool BeValidRole(string role)
        {
            var validRoles = new[] { "Student", "Faculty", "Admin" };
            return validRoles.Contains(role);
        }
    }

}
