using FluentValidation;
using GradeSense.API.DTOs.Prediction.Request;

namespace GradeSense.API.Validators.Prediction
{
    public class UpdatePredictionRequestValidator : AbstractValidator<UpdatePredictionRequest>
    {
        public UpdatePredictionRequestValidator()
        {
            RuleFor(x => x.PredictedCategory)
                .Must(BeValidCategory).WithMessage("Predicted category must be At-Risk, Safe, High-Achiever, or Needs-Attention")
                .When(x => !string.IsNullOrEmpty(x.PredictedCategory));

            RuleFor(x => x.RiskScore)
                .InclusiveBetween(0m, 1m)
                .WithMessage("Risk score must be between 0 and 1")
                .PrecisionScale(5, 4, true)
                .WithMessage("Risk score must have at most 4 decimal places")
                .When(x => x.RiskScore.HasValue);

            RuleFor(x => x.ConfidenceScore)
                .InclusiveBetween(0m, 1m)
                .WithMessage("Confidence score must be between 0 and 1")
                .PrecisionScale(5, 4, true)
                .WithMessage("Confidence score must have at most 4 decimal places")
                .When(x => x.ConfidenceScore.HasValue);

            RuleFor(x => x.PredictedGrade)
                .MaximumLength(5).WithMessage("Predicted grade cannot exceed 5 characters")
                .When(x => !string.IsNullOrEmpty(x.PredictedGrade));

            RuleFor(x => x.PredictedMarks)
                .GreaterThanOrEqualTo(0).WithMessage("Predicted marks must be greater than or equal to 0")
                .LessThanOrEqualTo(9999.99m).WithMessage("Predicted marks cannot exceed 9999.99")
                .PrecisionScale(6, 2, true)
                .WithMessage("Predicted marks must have at most 2 decimal places")
                .When(x => x.PredictedMarks.HasValue);

            RuleFor(x => x.ModelAccuracy)
                .InclusiveBetween(0m, 1m)
                .WithMessage("Model accuracy must be between 0 and 1")
                .PrecisionScale(5, 4, true)
                .WithMessage("Model accuracy must have at most 4 decimal places")
                .When(x => x.ModelAccuracy.HasValue);

            RuleFor(x => x.ReviewedBy)
                .GreaterThan(0).WithMessage("Reviewed by ID must be greater than 0")
                .When(x => x.ReviewedBy.HasValue);
        }

        private bool BeValidCategory(string category)
        {
            var validCategories = new[] { "At-Risk", "Safe", "High-Achiever", "Needs-Attention" };
            return validCategories.Contains(category);
        }
    }
}