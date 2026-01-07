using FluentValidation;
using GradeSense.API.DTOs.StudentMark.Request;

namespace GradeSense.API.Validators.StudentMark
{
    public class UpdateStudentMarkRequestValidator : AbstractValidator<UpdateStudentMarkRequest>
    {
        public UpdateStudentMarkRequestValidator()
        {
            RuleFor(x => x.ObtainedMarks)
                .GreaterThanOrEqualTo(0).WithMessage("Obtained marks must be greater than or equal to 0")
                .LessThanOrEqualTo(9999.99m).WithMessage("Obtained marks cannot exceed 9999.99")
                .PrecisionScale(6, 2, true).WithMessage("Obtained marks must have at most 2 decimal places")
                .When(x => x.ObtainedMarks.HasValue);

            // Critical validation: If IsAbsent = true, ObtainedMarks must be NULL
            RuleFor(x => x.ObtainedMarks)
                .Null().WithMessage("Obtained marks must be null when student is marked as absent")
                .When(x => x.IsAbsent.HasValue && x.IsAbsent.Value);

            RuleFor(x => x.Remarks)
                .MaximumLength(5000).WithMessage("Remarks cannot exceed 5000 characters")
                .When(x => !string.IsNullOrEmpty(x.Remarks));

            RuleFor(x => x.GraderId)
                .GreaterThan(0).WithMessage("Grader ID must be greater than 0")
                .When(x => x.GraderId.HasValue);

            RuleFor(x => x.GradedDate)
                .LessThanOrEqualTo(DateTime.Now)
                .WithMessage("Graded date cannot be in the future")
                .When(x => x.GradedDate.HasValue);

            RuleFor(x => x.SubmissionDate)
                .LessThanOrEqualTo(DateTime.Now)
                .WithMessage("Submission date cannot be in the future")
                .When(x => x.SubmissionDate.HasValue);
        }
    }
}