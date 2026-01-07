using FluentValidation;
using GradeSense.API.DTOs.Department.Request;

namespace GradeSense.API.Validators.Department
{
    public class UpdateDepartmentRequestValidator : AbstractValidator<UpdateDepartmentRequest>
    {
        public UpdateDepartmentRequestValidator()
        {
            RuleFor(x => x.Name)
                .MinimumLength(2)
                .MaximumLength(255)
                .When(x => !string.IsNullOrEmpty(x.Name));

            RuleFor(x => x.Code)
                .MaximumLength(50)
                .Matches(@"^[A-Z0-9]+$")
                .When(x => !string.IsNullOrEmpty(x.Code));

            RuleFor(x => x.HODUserId)
                .GreaterThan(0)
                .When(x => x.HODUserId.HasValue);
        }
    }

}
