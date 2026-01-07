using FluentValidation;
using GradeSense.API.DTOs.Prediction.Request;

namespace GradeSense.API.Validators.Prediction
{
    public class CreatePredictionRequestValidator : AbstractValidator<CreatePredictionRequest>
    {
        public CreatePredictionRequestValidator()
        {
            RuleFor(x => x.CourseEnrollmentId)
                .GreaterThan(0).WithMessage("Course enrollment ID must be greater than 0");

            RuleFor(x => x.PredictedCategory)
                .NotEmpty().WithMessage("Predicted category is required")
                .Must(BeValidCategory).WithMessage("Predicted category must be At-Risk, Safe, High-Achiever, or Needs-Attention");

            RuleFor(x => x.RiskScore)
                .InclusiveBetween(0m, 1m)
                .WithMessage("Risk score must be between 0 and 1")
                .PrecisionScale(5, 4, true)
                .WithMessage("Risk score must have at most 4 decimal places");

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

            RuleFor(x => x.ModelVersion)
                .NotEmpty().WithMessage("Model version is required")
                .MaximumLength(50).WithMessage("Model version cannot exceed 50 characters");

            RuleFor(x => x.ModelAccuracy)
                .InclusiveBetween(0m, 1m)
                .WithMessage("Model accuracy must be between 0 and 1")
                .PrecisionScale(5, 4, true)
                .WithMessage("Model accuracy must have at most 4 decimal places")
                .When(x => x.ModelAccuracy.HasValue);

            RuleFor(x => x.ExpiresAt)
                .GreaterThan(x => x.GeneratedAt ?? DateTime.Now)
                .WithMessage("Expiry date must be after generation date")
                .When(x => x.ExpiresAt.HasValue);
        }

        private bool BeValidCategory(string category)
        {
            var validCategories = new[] { "At-Risk", "Safe", "High-Achiever", "Needs-Attention" };
            return validCategories.Contains(category);
        }
    }
}