namespace GradeSense.API.DTOs.Dashboard;

/// <summary>
/// Attendance Calendar Response - Calendar view of student attendance
/// </summary>
public class AttendanceCalendarResponse
{
    public int StudentId { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;

    // Course filter applied (null = all courses)
    public int? CourseOfferingId { get; set; }
    public string? SubjectCode { get; set; }
    public string? SubjectName { get; set; }

    // Summary for the month
    public AttendanceCalendarSummary Summary { get; set; } = new();

    // Day-wise attendance entries
    public List<AttendanceCalendarDay> Days { get; set; } = new();

    // Available courses for filtering
    public List<AttendanceCalendarCourse> AvailableCourses { get; set; } = new();
}

/// <summary>
/// Summary statistics for the calendar period
/// </summary>
public class AttendanceCalendarSummary
{
    public int TotalClasses { get; set; }
    public int PresentCount { get; set; }
    public int AbsentCount { get; set; }
    public int LateCount { get; set; }
    public int ExcusedCount { get; set; }
    public decimal AttendancePercentage { get; set; }
}

/// <summary>
/// Single day attendance entry in calendar
/// </summary>
public class AttendanceCalendarDay
{
    public DateOnly Date { get; set; }
    public int DayOfMonth { get; set; }
    public bool IsWeekend { get; set; }
    public bool IsToday { get; set; }

    // All attendance records for this day
    public List<AttendanceCalendarEntry> Entries { get; set; } = new();

    // Quick flags for styling
    public bool HasClasses => Entries.Count > 0;
    public bool HasAbsent => Entries.Any(e => e.Status == "Absent");
    public bool AllPresent => HasClasses && Entries.All(e => e.Status == "Present" || e.Status == "Late" || e.Status == "Excused");
}

/// <summary>
/// Single attendance entry for a class
/// </summary>
public class AttendanceCalendarEntry
{
    public int AttendanceRecordId { get; set; }
    public int EnrollmentId { get; set; }
    public int CourseOfferingId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // Present, Absent, Late, Excused
    public string? Remarks { get; set; }
    public string? RecordedByName { get; set; }
}

/// <summary>
/// Course option for filter dropdown
/// </summary>
public class AttendanceCalendarCourse
{
    public int CourseOfferingId { get; set; }
    public int EnrollmentId { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string SubjectName { get; set; } = string.Empty;
    public decimal AttendancePercentage { get; set; }
}
