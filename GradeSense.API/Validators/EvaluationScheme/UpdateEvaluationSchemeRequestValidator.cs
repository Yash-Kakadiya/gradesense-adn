using FluentValidation;
using GradeSense.API.DTOs.EvaluationScheme.Request;

namespace GradeSense.API.Validators.EvaluationScheme
{
    public class UpdateEvaluationSchemeRequestValidator : AbstractValidator<UpdateEvaluationSchemeRequest>
    {
        public UpdateEvaluationSchemeRequestValidator()
        {
            RuleFor(x => x.Name)
                .MinimumLength(2).WithMessage("Name must be at least 2 characters")
                .MaximumLength(255).WithMessage("Name cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.Name));

            RuleFor(x => x.Description)
                .MaximumLength(5000).WithMessage("Description cannot exceed 5000 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.TotalMarks)
                .GreaterThan(0).WithMessage("Total marks must be greater than 0")
                .LessThanOrEqualTo(9999.99m).WithMessage("Total marks cannot exceed 9999.99")
                .PrecisionScale(6, 2, true).WithMessage("Total marks must have at most 2 decimal places")
                .When(x => x.TotalMarks.HasValue);

            RuleFor(x => x.PassingMarks)
                .GreaterThanOrEqualTo(0).WithMessage("Passing marks must be greater than or equal to 0")
                .LessThanOrEqualTo(9999.99m).WithMessage("Passing marks cannot exceed 9999.99")
                .PrecisionScale(6, 2, true).WithMessage("Passing marks must have at most 2 decimal places")
                .When(x => x.PassingMarks.HasValue);

            RuleFor(x => x.Weight)
                .GreaterThan(0).WithMessage("Weight must be greater than 0")
                .LessThanOrEqualTo(100).WithMessage("Weight cannot exceed 100")
                .PrecisionScale(5, 2, true).WithMessage("Weight must have at most 2 decimal places")
                .When(x => x.Weight.HasValue);

            RuleFor(x => x.EvaluationType)
                .MaximumLength(50).WithMessage("Evaluation type cannot exceed 50 characters")
                .When(x => !string.IsNullOrEmpty(x.EvaluationType));

            // Custom validation: PassingMarks <= TotalMarks (when both are being updated)
            RuleFor(x => x)
                .Must(x => !x.PassingMarks.HasValue || !x.TotalMarks.HasValue || x.PassingMarks <= x.TotalMarks)
                .WithMessage("Passing marks cannot exceed total marks")
                .When(x => x.PassingMarks.HasValue && x.TotalMarks.HasValue);
        }
    }
}