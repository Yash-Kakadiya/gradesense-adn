using FluentValidation;
using GradeSense.API.DTOs.UploadHistory.Request;

namespace GradeSense.API.Validators.UploadHistory
{
    public class UpdateUploadHistoryRequestValidator : AbstractValidator<UpdateUploadHistoryRequest>
    {
        public UpdateUploadHistoryRequestValidator()
        {
            RuleFor(x => x.SuccessCount)
                .GreaterThanOrEqualTo(0).WithMessage("Success count must be greater than or equal to 0")
                .When(x => x.SuccessCount.HasValue);

            RuleFor(x => x.ErrorCount)
                .GreaterThanOrEqualTo(0).WithMessage("Error count must be greater than or equal to 0")
                .When(x => x.ErrorCount.HasValue);

            RuleFor(x => x.TotalCount)
                .GreaterThanOrEqualTo(0).WithMessage("Total count must be greater than or equal to 0")
                .When(x => x.TotalCount.HasValue);

            RuleFor(x => x.Status)
                .Must(BeValidStatus).WithMessage("Status must be Processing, Completed, or Failed")
                .When(x => !string.IsNullOrEmpty(x.Status));

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