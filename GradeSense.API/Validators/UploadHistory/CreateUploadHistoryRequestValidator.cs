using FluentValidation;
using GradeSense.API.DTOs.UploadHistory.Request;

namespace GradeSense.API.Validators.UploadHistory
{
    public class CreateUploadHistoryRequestValidator : AbstractValidator<CreateUploadHistoryRequest>
    {
        public CreateUploadHistoryRequestValidator()
        {
            RuleFor(x => x.CourseOfferingId)
                .GreaterThan(0).WithMessage("Course offering ID must be greater than 0");

            RuleFor(x => x.AssessmentItemId)
                .GreaterThan(0).WithMessage("Assessment item ID must be greater than 0")
                .When(x => x.AssessmentItemId.HasValue);

            RuleFor(x => x.UploadedBy)
                .GreaterThan(0).WithMessage("Uploaded by ID must be greater than 0");

            RuleFor(x => x.FileName)
                .NotEmpty().WithMessage("File name is required")
                .MaximumLength(500).WithMessage("File name cannot exceed 500 characters");

            RuleFor(x => x.FileSize)
                .GreaterThanOrEqualTo(0).WithMessage("File size must be greater than or equal to 0")
                .LessThanOrEqualTo(1073741824).WithMessage("File size cannot exceed 1GB (1073741824 bytes)")
                .When(x => x.FileSize.HasValue);

            RuleFor(x => x.SuccessCount)
                .GreaterThanOrEqualTo(0).WithMessage("Success count must be greater than or equal to 0");

            RuleFor(x => x.ErrorCount)
                .GreaterThanOrEqualTo(0).WithMessage("Error count must be greater than or equal to 0");

            RuleFor(x => x.TotalCount)
                .GreaterThanOrEqualTo(0).WithMessage("Total count must be greater than or equal to 0");

            RuleFor(x => x.Status)
                .NotEmpty().WithMessage("Status is required")
                .Must(BeValidStatus).WithMessage("Status must be Processing, Completed, or Failed");

            RuleFor(x => x.ErrorDetails)
                .MaximumLength(10000).WithMessage("Error details cannot exceed 10000 characters")
                .When(x => !string.IsNullOrEmpty(x.ErrorDetails));
        }

        private bool BeValidStatus(string status)
        {
            var validStatuses = new[] { "Processing", "Completed", "Failed" };
            return validStatuses.Contains(status);
        }
    }
}