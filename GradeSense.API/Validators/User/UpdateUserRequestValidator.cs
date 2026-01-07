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

            RuleFor(x => x.Email)
                .EmailAddress().WithMessage("Invalid email format")
                .MaximumLength(255).WithMessage("Email cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.Email));

            RuleFor(x => x.FullName)
                .MinimumLength(2).WithMessage("Full name must be at least 2 characters")
                .MaximumLength(255).WithMessage("Full name cannot exceed 255 characters")
                .Matches(@"^[a-zA-Z\s.'-]+$").WithMessage("Full name can only contain letters, spaces, dots, hyphens and apostrophes")
                .When(x => !string.IsNullOrEmpty(x.FullName));

            RuleFor(x => x.Role)
                .Must(BeValidRole).WithMessage("Role must be Student, Faculty, or Admin")
                .When(x => !string.IsNullOrEmpty(x.Role));
        }

        private bool BeValidRole(string role)
        {
            var validRoles = new[] { "Student", "Faculty", "Admin" };
            return validRoles.Contains(role);
        }
    }
}
