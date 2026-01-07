using FluentValidation;
using GradeSense.API.DTOs.SubjectUnit.Request;

namespace GradeSense.API.Validators.SubjectUnit
{
    public class UpdateSubjectUnitRequestValidator : AbstractValidator<UpdateSubjectUnitRequest>
    {
        public UpdateSubjectUnitRequestValidator()
        {
            RuleFor(x => x.SubjectId)
                .GreaterThan(0).WithMessage("Subject ID must be greater than 0")
                .When(x => x.SubjectId.HasValue);

            RuleFor(x => x.UnitNumber)
                .GreaterThan(0).WithMessage("Unit number must be greater than 0")
                .LessThanOrEqualTo(50).WithMessage("Unit number cannot exceed 50")
                .When(x => x.UnitNumber.HasValue);

            RuleFor(x => x.TopicName)
                .MinimumLength(2).WithMessage("Topic name must be at least 2 characters")
                .MaximumLength(255).WithMessage("Topic name cannot exceed 255 characters")
                .When(x => !string.IsNullOrEmpty(x.TopicName));

            RuleFor(x => x.Description)
                .MaximumLength(5000).WithMessage("Description cannot exceed 5000 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.TeachingHours)
                .GreaterThan(0).WithMessage("Teaching hours must be greater than 0")
                .LessThanOrEqualTo(500).WithMessage("Teaching hours cannot exceed 500")
                .When(x => x.TeachingHours.HasValue);

            RuleFor(x => x.Weightage)
                .InclusiveBetween(0m, 999.99m)
                .WithMessage("Weightage must be between 0.00 and 999.99")
                .PrecisionScale(5, 2, true)
                .WithMessage("Weightage must have at most 2 decimal places")
                .When(x => x.Weightage.HasValue);

            RuleFor(x => x.LearningOutcomes)
                .MaximumLength(5000).WithMessage("Learning outcomes cannot exceed 5000 characters")
                .When(x => !string.IsNullOrEmpty(x.LearningOutcomes));
        }
    }
}