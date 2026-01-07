namespace GradeSense.API.DTOs.User.Response;

public class StudentInfoResponse
{
    public string EnrollmentNumber { get; set; } = string.Empty;
    public int AdmissionYear { get; set; }
    public int CurrentSemester { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal? CGPA { get; set; }
}