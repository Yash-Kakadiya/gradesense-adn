using FluentValidation;
using GradeSense.API.DTOs.AuditLog.Request;

namespace GradeSense.API.Validators.AuditLog
{
    public class UpdateAuditLogRequestValidator : AbstractValidator<UpdateAuditLogRequest>
    {
        public UpdateAuditLogRequestValidator()
        {
            RuleFor(x => x.Reason)
                .MaximumLength(1000).WithMessage("Reason cannot exceed 1000 characters")
                .When(x => !string.IsNullOrEmpty(x.Reason));
        }
    }
}