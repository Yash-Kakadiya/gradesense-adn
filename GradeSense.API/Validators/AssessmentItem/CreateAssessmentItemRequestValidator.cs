using FluentValidation;
using GradeSense.API.DTOs.AssessmentItem.Request;

namespace GradeSense.API.Validators.AssessmentItem
{
    public class CreateAssessmentItemRequestValidator : AbstractValidator<CreateAssessmentItemRequest>
    {
        public CreateAssessmentItemRequestValidator()
        {
            RuleFor(x => x.EvaluationSchemeId)
                .GreaterThan(0).WithMessage("Evaluation scheme ID must be greater than 0");

            RuleFor(x => x.SubjectUnitId)
                .GreaterThan(0).WithMessage("Subject unit ID must be greater than 0")
                .When(x => x.SubjectUnitId.HasValue);

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Assessment item name is required")
                .MinimumLength(2).WithMessage("Name must be at least 2 characters")
                .MaximumLength(255).WithMessage("Name cannot exceed 255 characters");

            RuleFor(x => x.Description)
                .MaximumLength(5000).WithMessage("Description cannot exceed 5000 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.MaxMarks)
                .GreaterThan(0).WithMessage("Maximum marks must be greater than 0")
                .LessThanOrEqualTo(9999.99m).WithMessage("Maximum marks cannot exceed 9999.99")
                .PrecisionScale(6, 2, true).WithMessage("Maximum marks must have at most 2 decimal places");

            RuleFor(x => x.CalculationType)
                .NotEmpty().WithMessage("Calculation type is required")
                .Must(BeValidCalculationType).WithMessage("Calculation type must be Raw, Average, or BestOf");

            RuleFor(x => x.Weight)
                .GreaterThan(0).WithMessage("Weight must be greater than 0")
                .LessThanOrEqualTo(100).WithMessage("Weight cannot exceed 100")
                .PrecisionScale(5, 2, true).WithMessage("Weight must have at most 2 decimal places")
                .When(x => x.Weight.HasValue);

            RuleFor(x => x.ScheduledDate)
                .LessThan(x => x.DueDate)
                .WithMessage("Scheduled date must be before due date")
                .When(x => x.ScheduledDate.HasValue && x.DueDate.HasValue);

            RuleFor(x => x.DueDate)
                .GreaterThan(x => x.ScheduledDate)
                .WithMessage("Due date must be after scheduled date")
                .When(x => x.ScheduledDate.HasValue && x.DueDate.HasValue);

            RuleFor(x => x.CreatedBy)
                .GreaterThan(0).WithMessage("Created by ID must be greater than 0")
                .When(x => x.CreatedBy.HasValue);
        }

        private bool BeValidCalculationType(string calculationType)
        {
            var validTypes = new[] { "Raw", "Average", "BestOf" };
            return validTypes.Contains(calculationType);
        }
    }
}