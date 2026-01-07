using FluentValidation;
using GradeSense.API.DTOs.FacultyAssignment.Request;

namespace GradeSense.API.Validators.FacultyAssignment
{
    public class CreateFacultyAssignmentRequestValidator : AbstractValidator<CreateFacultyAssignmentRequest>
    {
        public CreateFacultyAssignmentRequestValidator()
        {
            RuleFor(x => x.CourseOfferingId)
                .GreaterThan(0).WithMessage("Course offering ID must be greater than 0");

            RuleFor(x => x.FacultyId)
                .GreaterThan(0).WithMessage("Faculty ID must be greater than 0");

            RuleFor(x => x.Role)
                .MaximumLength(50).WithMessage("Role cannot exceed 50 characters")
                .When(x => !string.IsNullOrEmpty(x.Role));

            RuleFor(x => x.AssignmentDate)
                .LessThanOrEqualTo(DateTime.Now)
                .WithMessage("Assignment date cannot be in the future")
                .When(x => x.AssignmentDate.HasValue);
        }
    }
}