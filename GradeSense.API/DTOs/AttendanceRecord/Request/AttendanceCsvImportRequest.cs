using CsvHelper.Configuration.Attributes;

namespace GradeSense.API.DTOs.AttendanceRecord.Request;

/// <summary>
/// CSV import request for attendance records
/// </summary>
public class AttendanceCsvImportRequest
{
    [Name("RollNumber", "Roll Number", "EnrollmentNumber", "Enrollment Number")]
    public string EnrollmentNumber { get; set; } = "";

    [Name("Status", "Attendance")]
    public string Status { get; set; } = "";

    [Name("Remarks", "Notes", "Comment")]
    public string? Remarks { get; set; }
}
