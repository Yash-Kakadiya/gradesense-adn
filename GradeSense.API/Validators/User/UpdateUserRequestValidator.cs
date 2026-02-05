using FluentValidation;
using GradeSense.API.DTOs.User.Request;
using GradeSense.API.Interfaces.Repositories;

namespace GradeSense.API.Validators.User
{
    public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
    {
        private readonly IUserRepository _userRepository;

        public UpdateUserRequestValidator(IUserRepository userRepository)
        {
            _userRepository = userRepository;

            RuleFor(x => x.PersonalEmail)
                .EmailAddress().WithMessage("Invalid personal email format")
                .MaximumLength(255).WithMessage("Personal email cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.PersonalEmail));

            RuleFor(x => x.InstitutionalEmail)
                .EmailAddress().WithMessage("Invalid institutional email format")
                .MaximumLength(255).WithMessage("Institutional email cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.InstitutionalEmail));

            RuleFor(x => x.PhoneNumber)
                .Matches(@"^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$")
                .WithMessage("Invalid phone number format")
                .MaximumLength(20).WithMessage("Phone number cannot exceed 20 characters")
                .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

            RuleFor(x => x.ProfileImagePath)
                .MaximumLength(500).WithMessage("Profile image path cannot exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.ProfileImagePath));

            RuleFor(x => x.FullName)
                .MinimumLength(2).WithMessage("Full name must be at least 2 characters")
                .MaximumLength(255).WithMessage("Full name cannot exceed 255 characters")
                .Matches(@"^[a-zA-Z\s.'-]+$").WithMessage("Full name can only contain letters, spaces, dots, hyphens and apostrophes")
                .When(x => !string.IsNullOrEmpty(x.FullName));

            RuleFor(x => x.Role)
                .Must(BeValidRole).WithMessage("Role must be Student, Faculty, or Admin")
                .When(x => !string.IsNullOrEmpty(x.Role));
        }

        private bool BeValidRole(string? role)
        {
            if (role == null) return false;
            var validRoles = new[] { "Student", "Faculty", "Admin" };
            return validRoles.Contains(role);
        }
    }
}
