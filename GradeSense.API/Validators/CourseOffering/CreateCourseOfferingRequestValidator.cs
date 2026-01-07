using FluentValidation;
using GradeSense.API.DTOs.CourseOffering.Request;

namespace GradeSense.API.Validators.CourseOffering
{
    public class CreateCourseOfferingRequestValidator : AbstractValidator<CreateCourseOfferingRequest>
    {
        public CreateCourseOfferingRequestValidator()
        {
            RuleFor(x => x.SubjectId)
                .GreaterThan(0).WithMessage("Subject ID must be greater than 0");

            RuleFor(x => x.BatchId)
                .GreaterThan(0).WithMessage("Batch ID must be greater than 0");

            RuleFor(x => x.SubjectCoordinatorId)
                .GreaterThan(0).WithMessage("Subject coordinator ID must be greater than 0");

            RuleFor(x => x.AcademicYear)
                .InclusiveBetween(2000, DateTime.Now.Year + 1)
                .WithMessage($"Academic year must be between 2000 and {DateTime.Now.Year + 1}");

            RuleFor(x => x.StartDate)
                .LessThan(x => x.EndDate)
                .WithMessage("Start date must be before end date")
                .When(x => x.StartDate.HasValue && x.EndDate.HasValue);

            RuleFor(x => x.EndDate)
                .GreaterThan(x => x.StartDate)
                .WithMessage("End date must be after start date")
                .When(x => x.StartDate.HasValue && x.EndDate.HasValue);

            RuleFor(x => x.MaxEnrollment)
                .GreaterThan(0).WithMessage("Maximum enrollment must be greater than 0")
                .LessThanOrEqualTo(1000).WithMessage("Maximum enrollment cannot exceed 1000")
                .When(x => x.MaxEnrollment.HasValue);
        }
    }
}