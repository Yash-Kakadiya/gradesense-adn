using FluentValidation;
using GradeSense.API.DTOs.AuditLog.Request;

namespace GradeSense.API.Validators.AuditLog
{
    public class CreateAuditLogRequestValidator : AbstractValidator<CreateAuditLogRequest>
    {
        public CreateAuditLogRequestValidator()
        {
            RuleFor(x => x.Action)
                .NotEmpty().WithMessage("Action is required")
                .MaximumLength(50).WithMessage("Action cannot exceed 50 characters");

            RuleFor(x => x.ActorUserId)
                .GreaterThan(0).WithMessage("Actor user ID must be greater than 0");

            RuleFor(x => x.EntityName)
                .NotEmpty().WithMessage("Entity name is required")
                .MaximumLength(100).WithMessage("Entity name cannot exceed 100 characters");

            RuleFor(x => x.EntityId)
                .NotEmpty().WithMessage("Entity ID is required")
                .MaximumLength(100).WithMessage("Entity ID cannot exceed 100 characters");

            RuleFor(x => x.OldValue)
                .MaximumLength(10000).WithMessage("Old value cannot exceed 10000 characters")
                .When(x => !string.IsNullOrEmpty(x.OldValue));

            RuleFor(x => x.NewValue)
                .MaximumLength(10000).WithMessage("New value cannot exceed 10000 characters")
                .When(x => !string.IsNullOrEmpty(x.NewValue));

            RuleFor(x => x.ChangedFields)
                .MaximumLength(1000).WithMessage("Changed fields cannot exceed 1000 characters")
                .When(x => !string.IsNullOrEmpty(x.ChangedFields));

            RuleFor(x => x.OccurredAt)
                .LessThanOrEqualTo(DateTime.Now)
                .WithMessage("Occurred at cannot be in the future")
                .When(x => x.OccurredAt.HasValue);

            RuleFor(x => x.IPAddress)
                .MaximumLength(45).WithMessage("IP address cannot exceed 45 characters")
                .Matches(@"^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$")
                .WithMessage("Invalid IP address format")
                .When(x => !string.IsNullOrEmpty(x.IPAddress));

            RuleFor(x => x.UserAgent)
                .MaximumLength(500).WithMessage("User agent cannot exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.UserAgent));

            RuleFor(x => x.SessionId)
                .MaximumLength(255).WithMessage("Session ID cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.SessionId));

            RuleFor(x => x.Reason)
                .MaximumLength(1000).WithMessage("Reason cannot exceed 1000 characters")
                .When(x => !string.IsNullOrEmpty(x.Reason));
        }
    }
}