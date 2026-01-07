using FluentValidation;
using GradeSense.API.DTOs.AttendanceRecord.Request;

namespace GradeSense.API.Validators.AttendanceRecord
{
    public class UpdateAttendanceRecordRequestValidator : AbstractValidator<UpdateAttendanceRecordRequest>
    {
        public UpdateAttendanceRecordRequestValidator()
        {
            RuleFor(x => x.AttendanceDate)
                .LessThanOrEqualTo(DateOnly.FromDateTime(DateTime.Now))
                .WithMessage("Attendance date cannot be in the future")
                .When(x => x.AttendanceDate.HasValue);

            RuleFor(x => x.Status)
                .Must(BeValidStatus).WithMessage("Status must be Present, Absent, Excused, or Late")
                .When(x => !string.IsNullOrEmpty(x.Status));

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