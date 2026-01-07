using FluentValidation;
using GradeSense.API.DTOs.AttendanceRecord.Request;

namespace GradeSense.API.Validators.AttendanceRecord
{
    public class CreateAttendanceRecordRequestValidator : AbstractValidator<CreateAttendanceRecordRequest>
    {
        public CreateAttendanceRecordRequestValidator()
        {
            RuleFor(x => x.EnrollmentId)
                .GreaterThan(0).WithMessage("Enrollment ID must be greater than 0");

            RuleFor(x => x.AttendanceDate)
                .NotEmpty().WithMessage("Attendance date is required")
                .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Now))
                .WithMessage("Attendance date cannot be in the future");

            RuleFor(x => x.Status)
                .NotEmpty().WithMessage("Status is required")
                .Must(BeValidStatus).WithMessage("Status must be Present, Absent, Excused, or Late");

            RuleFor(x => x.RecordedBy)
                .GreaterThan(0).WithMessage("Recorded by ID must be greater than 0")
                .When(x => x.RecordedBy.HasValue);

            RuleFor(x => x.Remarks)
                .MaximumLength(1000).WithMessage("Remarks cannot exceed 1000 characters")
                .When(x => !string.IsNullOrEmpty(x.Remarks));
        }

        private bool BeValidStatus(string status)
        {
            var validStatuses = new[] { "Present", "Absent", "Excused", "Late" };
            return validStatuses.Contains(status);
        }
    }
}