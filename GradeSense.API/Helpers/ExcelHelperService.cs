using ClosedXML.Excel;
using System.Collections;
using System.Reflection;

namespace GradeSense.API.Helpers;

/// <summary>
/// Excel parsing error
/// </summary>
public class ExcelParseError
{
    public int RowNumber { get; set; }
    public string? RawData { get; set; }
    public string ErrorMessage { get; set; } = string.Empty;
}

/// <summary>
/// Helper class for Excel generation and parsing using ClosedXML
/// </summary>
public static class ExcelHelperService
{
    #region Excel Generation
    
    /// <summary>
    /// Generate Excel file from list of objects
    /// </summary>
    public static byte[] GenerateExcel<T>(IEnumerable<T> records, string sheetName = "Data") where T : class
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add(sheetName);

        var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
        
        // Write headers
        for (int i = 0; i < properties.Length; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = FormatHeaderName(properties[i].Name);
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            cell.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
        }

        // Write data
        int row = 2;
        foreach (var record in records)
        {
            for (int i = 0; i < properties.Length; i++)
            {
                var value = properties[i].GetValue(record);
                var cell = worksheet.Cell(row, i + 1);
                
                if (value == null)
                {
                    cell.Value = string.Empty;
                }
                else if (value is DateTime dateTime)
                {
                    cell.Value = dateTime;
                    cell.Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";
                }
                else if (value is DateOnly dateOnly)
                {
                    cell.Value = dateOnly.ToDateTime(TimeOnly.MinValue);
                    cell.Style.DateFormat.Format = "yyyy-MM-dd";
                }
                else if (value is bool boolValue)
                {
                    cell.Value = boolValue ? "Yes" : "No";
                }
                else if (value is decimal decimalValue)
                {
                    cell.Value = decimalValue;
                    cell.Style.NumberFormat.Format = "#,##0.00";
                }
                else
                {
                    cell.Value = value.ToString();
                }
            }
            row++;
        }

        // Auto-fit columns
        worksheet.Columns().AdjustToContents();

        // Freeze header row
        worksheet.SheetView.FreezeRows(1);

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    /// <summary>
    /// Generate Excel file with multiple sheets
    /// </summary>
    public static byte[] GenerateExcelWithMultipleSheets(Dictionary<string, object> sheets)
    {
        using var workbook = new XLWorkbook();

        foreach (var sheet in sheets)
        {
            var sheetName = sheet.Key;
            var data = sheet.Value;
            
            // Handle IEnumerable types (lists)
            if (data is IEnumerable enumerable && data is not string)
            {
                AddSheetFromEnumerable(workbook, sheetName, enumerable);
            }
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    /// <summary>
    /// Add a sheet from any IEnumerable by inspecting the actual runtime type of elements
    /// </summary>
    private static void AddSheetFromEnumerable(XLWorkbook workbook, string sheetName, IEnumerable data)
    {
        var worksheet = workbook.Worksheets.Add(sheetName);
        
        // Get the first element to determine properties
        object? firstElement = null;
        PropertyInfo[]? properties = null;
        
        var enumerator = data.GetEnumerator();
        if (enumerator.MoveNext())
        {
            firstElement = enumerator.Current;
            if (firstElement != null)
            {
                // Get the actual runtime type (this handles anonymous types)
                properties = firstElement.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
            }
        }

        if (properties == null || properties.Length == 0)
        {
            // Empty data or no properties
            worksheet.Cell(1, 1).Value = "No data";
            return;
        }

        // Write headers
        for (int i = 0; i < properties.Length; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = FormatHeaderName(properties[i].Name);
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            cell.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
        }

        // Write data - start over from beginning
        int row = 2;
        foreach (var record in data)
        {
            if (record == null) continue;
            
            for (int i = 0; i < properties.Length; i++)
            {
                var value = properties[i].GetValue(record);
                var cell = worksheet.Cell(row, i + 1);
                SetCellValue(cell, value);
            }
            row++;
        }

        // Auto-fit columns
        worksheet.Columns().AdjustToContents();

        // Freeze header row
        worksheet.SheetView.FreezeRows(1);
    }

    private static void AddSheet<T>(XLWorkbook workbook, string sheetName, List<T> records) where T : class
    {
        var worksheet = workbook.Worksheets.Add(sheetName);
        var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        // Write headers
        for (int i = 0; i < properties.Length; i++)
        {
            var cell = worksheet.Cell(1, i + 1);
            cell.Value = FormatHeaderName(properties[i].Name);
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightGray;
            cell.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
        }

        // Write data
        int row = 2;
        foreach (var record in records)
        {
            for (int i = 0; i < properties.Length; i++)
            {
                var value = properties[i].GetValue(record);
                var cell = worksheet.Cell(row, i + 1);
                SetCellValue(cell, value);
            }
            row++;
        }

        // Auto-fit columns
        worksheet.Columns().AdjustToContents();

        // Freeze header row
        worksheet.SheetView.FreezeRows(1);
    }

    /// <summary>
    /// Set cell value with proper formatting based on type
    /// </summary>
    private static void SetCellValue(IXLCell cell, object? value)
    {
        if (value == null)
        {
            cell.Value = string.Empty;
        }
        else if (value is DateTime dateTime)
        {
            cell.Value = dateTime;
            cell.Style.DateFormat.Format = "yyyy-MM-dd HH:mm:ss";
        }
        else if (value is DateOnly dateOnly)
        {
            cell.Value = dateOnly.ToDateTime(TimeOnly.MinValue);
            cell.Style.DateFormat.Format = "yyyy-MM-dd";
        }
        else if (value is bool boolValue)
        {
            cell.Value = boolValue ? "Yes" : "No";
        }
        else if (value is decimal decimalValue)
        {
            cell.Value = decimalValue;
            cell.Style.NumberFormat.Format = "#,##0.00";
        }
        else if (value is double doubleValue)
        {
            cell.Value = doubleValue;
            cell.Style.NumberFormat.Format = "#,##0.00";
        }
        else if (value is float floatValue)
        {
            cell.Value = floatValue;
            cell.Style.NumberFormat.Format = "#,##0.00";
        }
        else if (value is int intValue)
        {
            cell.Value = intValue;
        }
        else if (value is long longValue)
        {
            cell.Value = longValue;
        }
        else
        {
            cell.Value = value.ToString();
        }
    }

    /// <summary>
    /// Format property name to human-readable header
    /// </summary>
    private static string FormatHeaderName(string propertyName)
    {
        // Insert space before uppercase letters (except first)
        var result = string.Concat(propertyName.Select((c, i) => 
            i > 0 && char.IsUpper(c) ? " " + c : c.ToString()));
        return result;
    }
    
    #endregion

    #region Excel Parsing

    /// <summary>
    /// Parse Excel file and return list of objects with column name mapping
    /// </summary>
    public static (List<T> Records, List<ExcelParseError> Errors) ParseExcel<T>(Stream stream, Dictionary<string, string>? columnMapping = null) where T : class, new()
    {
        var records = new List<T>();
        var errors = new List<ExcelParseError>();

        using var workbook = new XLWorkbook(stream);
        var worksheet = workbook.Worksheet(1);
        var rows = worksheet.RowsUsed().Skip(1); // Skip header row
        var headers = GetHeaders(worksheet);

        int rowNumber = 1;
        foreach (var row in rows)
        {
            rowNumber++;
            try
            {
                var record = new T();
                var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

                foreach (var property in properties)
                {
                    // Try to find column by property name or mapped name
                    var columnName = columnMapping?.GetValueOrDefault(property.Name) ?? property.Name;
                    var columnIndex = FindColumnIndex(headers, columnName);

                    if (columnIndex >= 0)
                    {
                        var cellValue = row.Cell(columnIndex + 1).Value;
                        SetPropertyValue(record, property, cellValue);
                    }
                }

                records.Add(record);
            }
            catch (Exception ex)
            {
                errors.Add(new ExcelParseError
                {
                    RowNumber = rowNumber,
                    RawData = string.Join(", ", row.CellsUsed().Select(c => c.GetString())),
                    ErrorMessage = ex.Message
                });
            }
        }

        return (records, errors);
    }

    /// <summary>
    /// Parse Excel file for grade import (specific format: Roll Number, Marks, IsAbsent, Remarks)
    /// </summary>
    public static (List<GradeImportRowData> Records, List<ExcelParseError> Errors) ParseGradeImportExcel(Stream stream)
    {
        var records = new List<GradeImportRowData>();
        var errors = new List<ExcelParseError>();

        using var workbook = new XLWorkbook(stream);
        var worksheet = workbook.Worksheet(1);
        var rows = worksheet.RowsUsed().Skip(1); // Skip header row
        var headers = GetHeaders(worksheet);

        // Find column indices
        int rollNumberCol = FindColumnIndex(headers, "Roll Number", "Enrollment Number", "EnrollmentNumber", "RollNumber");
        int marksCol = FindColumnIndex(headers, "Marks", "Obtained Marks", "ObtainedMarks", "MarksObtained");
        int absentCol = FindColumnIndex(headers, "Absent", "Is Absent", "IsAbsent");
        int remarksCol = FindColumnIndex(headers, "Remarks", "Comment", "Notes");

        if (rollNumberCol < 0)
        {
            errors.Add(new ExcelParseError { RowNumber = 0, ErrorMessage = "Roll Number column not found" });
            return (records, errors);
        }

        int rowNumber = 1;
        foreach (var row in rows)
        {
            rowNumber++;
            try
            {
                var rollNumber = row.Cell(rollNumberCol + 1).GetString().Trim();
                if (string.IsNullOrWhiteSpace(rollNumber)) continue;

                var marksStr = marksCol >= 0 ? row.Cell(marksCol + 1).GetString().Trim() : "";
                var absentStr = absentCol >= 0 ? row.Cell(absentCol + 1).GetString().Trim().ToLower() : "";
                var remarks = remarksCol >= 0 ? row.Cell(remarksCol + 1).GetString().Trim() : "";

                var record = new GradeImportRowData
                {
                    RowNumber = rowNumber,
                    RollNumber = rollNumber,
                    MarksObtained = marksStr,
                    IsAbsent = absentStr == "true" || absentStr == "yes" || absentStr == "1" || absentStr == "absent",
                    Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks
                };

                records.Add(record);
            }
            catch (Exception ex)
            {
                errors.Add(new ExcelParseError
                {
                    RowNumber = rowNumber,
                    RawData = string.Join(", ", row.CellsUsed().Select(c => c.GetString())),
                    ErrorMessage = ex.Message
                });
            }
        }

        return (records, errors);
    }

    /// <summary>
    /// Parse Excel file for attendance import (specific format: Roll Number, Status, Remarks)
    /// </summary>
    public static (List<AttendanceImportRowData> Records, List<ExcelParseError> Errors) ParseAttendanceImportExcel(Stream stream)
    {
        var records = new List<AttendanceImportRowData>();
        var errors = new List<ExcelParseError>();

        using var workbook = new XLWorkbook(stream);
        var worksheet = workbook.Worksheet(1);
        var rows = worksheet.RowsUsed().Skip(1); // Skip header row
        var headers = GetHeaders(worksheet);

        // Find column indices
        int rollNumberCol = FindColumnIndex(headers, "Roll Number", "Enrollment Number", "EnrollmentNumber", "RollNumber");
        int statusCol = FindColumnIndex(headers, "Status", "Attendance", "AttendanceStatus");
        int remarksCol = FindColumnIndex(headers, "Remarks", "Comment", "Notes");

        if (rollNumberCol < 0)
        {
            errors.Add(new ExcelParseError { RowNumber = 0, ErrorMessage = "Roll Number column not found" });
            return (records, errors);
        }

        int rowNumber = 1;
        foreach (var row in rows)
        {
            rowNumber++;
            try
            {
                var rollNumber = row.Cell(rollNumberCol + 1).GetString().Trim();
                if (string.IsNullOrWhiteSpace(rollNumber)) continue;

                var status = statusCol >= 0 ? row.Cell(statusCol + 1).GetString().Trim() : "Present";
                var remarks = remarksCol >= 0 ? row.Cell(remarksCol + 1).GetString().Trim() : "";

                // Normalize status
                status = NormalizeAttendanceStatus(status);

                var record = new AttendanceImportRowData
                {
                    RowNumber = rowNumber,
                    RollNumber = rollNumber,
                    Status = status,
                    Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks
                };

                records.Add(record);
            }
            catch (Exception ex)
            {
                errors.Add(new ExcelParseError
                {
                    RowNumber = rowNumber,
                    RawData = string.Join(", ", row.CellsUsed().Select(c => c.GetString())),
                    ErrorMessage = ex.Message
                });
            }
        }

        return (records, errors);
    }

    /// <summary>
    /// Get headers from first row of worksheet
    /// </summary>
    private static List<string> GetHeaders(IXLWorksheet worksheet)
    {
        var headers = new List<string>();
        var headerRow = worksheet.Row(1);
        foreach (var cell in headerRow.CellsUsed())
        {
            headers.Add(cell.GetString().Trim());
        }
        return headers;
    }

    /// <summary>
    /// Find column index by multiple possible header names (case-insensitive)
    /// </summary>
    private static int FindColumnIndex(List<string> headers, params string[] possibleNames)
    {
        for (int i = 0; i < headers.Count; i++)
        {
            var header = headers[i].Replace(" ", "").ToLower();
            foreach (var name in possibleNames)
            {
                if (header == name.Replace(" ", "").ToLower())
                    return i;
            }
        }
        return -1;
    }

    /// <summary>
    /// Set property value with type conversion
    /// </summary>
    private static void SetPropertyValue<T>(T record, PropertyInfo property, XLCellValue cellValue) where T : class
    {
        if (cellValue.IsBlank) return;

        var targetType = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;

        try
        {
            object? value = null;

            if (targetType == typeof(string))
            {
                value = cellValue.GetText();
            }
            else if (targetType == typeof(int))
            {
                value = cellValue.IsNumber ? (int)cellValue.GetNumber() : int.Parse(cellValue.GetText());
            }
            else if (targetType == typeof(decimal))
            {
                value = cellValue.IsNumber ? (decimal)cellValue.GetNumber() : decimal.Parse(cellValue.GetText());
            }
            else if (targetType == typeof(double))
            {
                value = cellValue.IsNumber ? cellValue.GetNumber() : double.Parse(cellValue.GetText());
            }
            else if (targetType == typeof(bool))
            {
                var text = cellValue.IsBoolean ? cellValue.GetBoolean().ToString() : cellValue.GetText().ToLower();
                value = text == "true" || text == "yes" || text == "1";
            }
            else if (targetType == typeof(DateTime))
            {
                value = cellValue.IsDateTime ? cellValue.GetDateTime() : DateTime.Parse(cellValue.GetText());
            }
            else if (targetType == typeof(DateOnly))
            {
                var dt = cellValue.IsDateTime ? cellValue.GetDateTime() : DateTime.Parse(cellValue.GetText());
                value = DateOnly.FromDateTime(dt);
            }

            if (value != null)
            {
                property.SetValue(record, value);
            }
        }
        catch
        {
            // Ignore conversion errors, leave property with default value
        }
    }

    /// <summary>
    /// Normalize attendance status string to valid value
    /// </summary>
    private static string NormalizeAttendanceStatus(string status)
    {
        var lower = status.ToLower().Trim();
        return lower switch
        {
            "p" or "present" or "1" or "yes" => "Present",
            "a" or "absent" or "0" or "no" => "Absent",
            "l" or "late" or "tardy" => "Late",
            "e" or "excused" or "exc" => "Excused",
            _ => "Present" // Default
        };
    }

    /// <summary>
    /// Parse Excel file for enrollment import (simple format: Roll Number only)
    /// </summary>
    public static (List<EnrollmentImportRowData> Records, List<ExcelParseError> Errors) ParseEnrollmentImportExcel(Stream stream)
    {
        var records = new List<EnrollmentImportRowData>();
        var errors = new List<ExcelParseError>();

        using var workbook = new XLWorkbook(stream);
        var worksheet = workbook.Worksheet(1);
        var rows = worksheet.RowsUsed().Skip(1); // Skip header row
        var headers = GetHeaders(worksheet);

        // Find column index for roll number
        int rollNumberCol = FindColumnIndex(headers, "Roll Number", "Enrollment Number", "EnrollmentNumber", "RollNumber", "Student ID");

        if (rollNumberCol < 0)
        {
            errors.Add(new ExcelParseError { RowNumber = 0, ErrorMessage = "Roll Number column not found. Expected headers: 'Roll Number', 'Enrollment Number', or 'Student ID'" });
            return (records, errors);
        }

        int rowNumber = 1;
        foreach (var row in rows)
        {
            rowNumber++;
            try
            {
                var rollNumber = row.Cell(rollNumberCol + 1).GetString().Trim();
                if (string.IsNullOrWhiteSpace(rollNumber)) continue;

                var record = new EnrollmentImportRowData
                {
                    RowNumber = rowNumber,
                    RollNumber = rollNumber
                };

                records.Add(record);
            }
            catch (Exception ex)
            {
                errors.Add(new ExcelParseError
                {
                    RowNumber = rowNumber,
                    RawData = string.Join(", ", row.CellsUsed().Select(c => c.GetString())),
                    ErrorMessage = ex.Message
                });
            }
        }

        return (records, errors);
    }

    /// <summary>
    /// Parse Excel file for user import
    /// </summary>
    public static (List<UserImportRowData> Records, List<ExcelParseError> Errors) ParseUserImportExcel(Stream stream)
    {
        var records = new List<UserImportRowData>();
        var errors = new List<ExcelParseError>();

        using var workbook = new XLWorkbook(stream);
        var worksheet = workbook.Worksheet(1);
        var rows = worksheet.RowsUsed().Skip(1);
        var headers = GetHeaders(worksheet);

        int emailCol = FindColumnIndex(headers, "Personal Email", "PersonalEmail", "Email");
        int instEmailCol = FindColumnIndex(headers, "Institutional Email", "InstitutionalEmail", "Work Email");
        int phoneCol = FindColumnIndex(headers, "Phone", "PhoneNumber", "Phone Number");
        int nameCol = FindColumnIndex(headers, "Full Name", "FullName", "Name");
        int passwordCol = FindColumnIndex(headers, "Password", "Initial Password");
        int roleCol = FindColumnIndex(headers, "Role", "User Role");
        int activeCol = FindColumnIndex(headers, "Active", "IsActive", "Is Active");

        if (emailCol < 0)
        {
            errors.Add(new ExcelParseError { RowNumber = 0, ErrorMessage = "Personal Email column not found" });
            return (records, errors);
        }
        if (nameCol < 0)
        {
            errors.Add(new ExcelParseError { RowNumber = 0, ErrorMessage = "Full Name column not found" });
            return (records, errors);
        }

        int rowNumber = 1;
        foreach (var row in rows)
        {
            rowNumber++;
            try
            {
                var email = row.Cell(emailCol + 1).GetString().Trim();
                if (string.IsNullOrWhiteSpace(email)) continue;

                var record = new UserImportRowData
                {
                    RowNumber = rowNumber,
                    PersonalEmail = email,
                    InstitutionalEmail = instEmailCol >= 0 ? row.Cell(instEmailCol + 1).GetString().Trim() : null,
                    PhoneNumber = phoneCol >= 0 ? row.Cell(phoneCol + 1).GetString().Trim() : null,
                    FullName = nameCol >= 0 ? row.Cell(nameCol + 1).GetString().Trim() : "",
                    Password = passwordCol >= 0 ? row.Cell(passwordCol + 1).GetString().Trim() : "",
                    Role = roleCol >= 0 ? NormalizeRole(row.Cell(roleCol + 1).GetString().Trim()) : "Student",
                    IsActive = activeCol >= 0 ? ParseBoolValue(row.Cell(activeCol + 1).GetString().Trim()) : true
                };

                records.Add(record);
            }
            catch (Exception ex)
            {
                errors.Add(new ExcelParseError
                {
                    RowNumber = rowNumber,
                    RawData = string.Join(", ", row.CellsUsed().Select(c => c.GetString())),
                    ErrorMessage = ex.Message
                });
            }
        }

        return (records, errors);
    }

    /// <summary>
    /// Parse Excel file for student import
    /// </summary>
    public static (List<StudentImportRowData> Records, List<ExcelParseError> Errors) ParseStudentImportExcel(Stream stream)
    {
        var records = new List<StudentImportRowData>();
        var errors = new List<ExcelParseError>();

        using var workbook = new XLWorkbook(stream);
        var worksheet = workbook.Worksheet(1);
        var rows = worksheet.RowsUsed().Skip(1);
        var headers = GetHeaders(worksheet);

        int emailCol = FindColumnIndex(headers, "Personal Email", "PersonalEmail", "Email");
        int instEmailCol = FindColumnIndex(headers, "Institutional Email", "InstitutionalEmail", "Work Email");
        int phoneCol = FindColumnIndex(headers, "Phone", "PhoneNumber", "Phone Number");
        int nameCol = FindColumnIndex(headers, "Full Name", "FullName", "Name");
        int passwordCol = FindColumnIndex(headers, "Password", "Initial Password");
        int enrollCol = FindColumnIndex(headers, "Enrollment Number", "EnrollmentNumber", "Roll Number", "RollNumber");
        int admissionCol = FindColumnIndex(headers, "Admission Year", "AdmissionYear", "Year");
        int semesterCol = FindColumnIndex(headers, "Current Semester", "CurrentSemester", "Semester");
        int deptCol = FindColumnIndex(headers, "Department Code", "DepartmentCode", "Department");
        int batchCol = FindColumnIndex(headers, "Batch", "BatchName", "Batch Name");
        int statusCol = FindColumnIndex(headers, "Status", "Student Status");

        if (emailCol < 0)
        {
            errors.Add(new ExcelParseError { RowNumber = 0, ErrorMessage = "Personal Email column not found" });
            return (records, errors);
        }
        if (nameCol < 0)
        {
            errors.Add(new ExcelParseError { RowNumber = 0, ErrorMessage = "Full Name column not found" });
            return (records, errors);
        }
        if (enrollCol < 0)
        {
            errors.Add(new ExcelParseError { RowNumber = 0, ErrorMessage = "Enrollment Number column not found" });
            return (records, errors);
        }

        int rowNumber = 1;
        foreach (var row in rows)
        {
            rowNumber++;
            try
            {
                var email = row.Cell(emailCol + 1).GetString().Trim();
                if (string.IsNullOrWhiteSpace(email)) continue;

                var record = new StudentImportRowData
                {
                    RowNumber = rowNumber,
                    PersonalEmail = email,
                    InstitutionalEmail = instEmailCol >= 0 ? row.Cell(instEmailCol + 1).GetString().Trim() : null,
                    PhoneNumber = phoneCol >= 0 ? row.Cell(phoneCol + 1).GetString().Trim() : null,
                    FullName = nameCol >= 0 ? row.Cell(nameCol + 1).GetString().Trim() : "",
                    Password = passwordCol >= 0 ? row.Cell(passwordCol + 1).GetString().Trim() : "",
                    EnrollmentNumber = enrollCol >= 0 ? row.Cell(enrollCol + 1).GetString().Trim() : "",
                    AdmissionYear = admissionCol >= 0 ? ParseIntValue(row.Cell(admissionCol + 1).GetString().Trim(), DateTime.Now.Year) : DateTime.Now.Year,
                    CurrentSemester = semesterCol >= 0 ? ParseIntValue(row.Cell(semesterCol + 1).GetString().Trim(), 1) : 1,
                    DepartmentCode = deptCol >= 0 ? row.Cell(deptCol + 1).GetString().Trim() : "",
                    BatchName = batchCol >= 0 ? row.Cell(batchCol + 1).GetString().Trim() : null,
                    Status = statusCol >= 0 ? NormalizeStudentStatus(row.Cell(statusCol + 1).GetString().Trim()) : "Active"
                };

                records.Add(record);
            }
            catch (Exception ex)
            {
                errors.Add(new ExcelParseError
                {
                    RowNumber = rowNumber,
                    RawData = string.Join(", ", row.CellsUsed().Select(c => c.GetString())),
                    ErrorMessage = ex.Message
                });
            }
        }

        return (records, errors);
    }

    /// <summary>
    /// Parse Excel file for faculty import
    /// </summary>
    public static (List<FacultyImportRowData> Records, List<ExcelParseError> Errors) ParseFacultyImportExcel(Stream stream)
    {
        var records = new List<FacultyImportRowData>();
        var errors = new List<ExcelParseError>();

        using var workbook = new XLWorkbook(stream);
        var worksheet = workbook.Worksheet(1);
        var rows = worksheet.RowsUsed().Skip(1);
        var headers = GetHeaders(worksheet);

        int emailCol = FindColumnIndex(headers, "Personal Email", "PersonalEmail", "Email");
        int instEmailCol = FindColumnIndex(headers, "Institutional Email", "InstitutionalEmail", "Work Email");
        int phoneCol = FindColumnIndex(headers, "Phone", "PhoneNumber", "Phone Number");
        int nameCol = FindColumnIndex(headers, "Full Name", "FullName", "Name");
        int passwordCol = FindColumnIndex(headers, "Password", "Initial Password");
        int empIdCol = FindColumnIndex(headers, "Employee ID", "EmployeeId", "Employee Number");
        int deptCol = FindColumnIndex(headers, "Department Code", "DepartmentCode", "Department");
        int designationCol = FindColumnIndex(headers, "Designation", "Position", "Title");
        int joiningCol = FindColumnIndex(headers, "Joining Date", "JoiningDate", "Join Date");
        int specialCol = FindColumnIndex(headers, "Specialization", "Expertise", "Area");
        int statusCol = FindColumnIndex(headers, "Status", "Faculty Status");

        if (emailCol < 0)
        {
            errors.Add(new ExcelParseError { RowNumber = 0, ErrorMessage = "Personal Email column not found" });
            return (records, errors);
        }
        if (nameCol < 0)
        {
            errors.Add(new ExcelParseError { RowNumber = 0, ErrorMessage = "Full Name column not found" });
            return (records, errors);
        }
        if (empIdCol < 0)
        {
            errors.Add(new ExcelParseError { RowNumber = 0, ErrorMessage = "Employee ID column not found" });
            return (records, errors);
        }

        int rowNumber = 1;
        foreach (var row in rows)
        {
            rowNumber++;
            try
            {
                var email = row.Cell(emailCol + 1).GetString().Trim();
                if (string.IsNullOrWhiteSpace(email)) continue;

                var record = new FacultyImportRowData
                {
                    RowNumber = rowNumber,
                    PersonalEmail = email,
                    InstitutionalEmail = instEmailCol >= 0 ? row.Cell(instEmailCol + 1).GetString().Trim() : null,
                    PhoneNumber = phoneCol >= 0 ? row.Cell(phoneCol + 1).GetString().Trim() : null,
                    FullName = nameCol >= 0 ? row.Cell(nameCol + 1).GetString().Trim() : "",
                    Password = passwordCol >= 0 ? row.Cell(passwordCol + 1).GetString().Trim() : "",
                    EmployeeId = empIdCol >= 0 ? row.Cell(empIdCol + 1).GetString().Trim() : "",
                    DepartmentCode = deptCol >= 0 ? row.Cell(deptCol + 1).GetString().Trim() : "",
                    Designation = designationCol >= 0 ? row.Cell(designationCol + 1).GetString().Trim() : "Assistant Professor",
                    JoiningDate = joiningCol >= 0 ? ParseDateOnlyValue(row.Cell(joiningCol + 1)) : null,
                    Specialization = specialCol >= 0 ? row.Cell(specialCol + 1).GetString().Trim() : null,
                    Status = statusCol >= 0 ? NormalizeFacultyStatus(row.Cell(statusCol + 1).GetString().Trim()) : "Active"
                };

                records.Add(record);
            }
            catch (Exception ex)
            {
                errors.Add(new ExcelParseError
                {
                    RowNumber = rowNumber,
                    RawData = string.Join(", ", row.CellsUsed().Select(c => c.GetString())),
                    ErrorMessage = ex.Message
                });
            }
        }

        return (records, errors);
    }

    /// <summary>
    /// Normalize role string to valid value
    /// </summary>
    private static string NormalizeRole(string role)
    {
        var lower = role.ToLower().Trim();
        return lower switch
        {
            "admin" or "administrator" => "Admin",
            "faculty" or "teacher" or "professor" => "Faculty",
            "student" or "learner" => "Student",
            _ => "Student"
        };
    }

    /// <summary>
    /// Normalize student status string
    /// </summary>
    private static string NormalizeStudentStatus(string status)
    {
        var lower = status.ToLower().Trim();
        return lower switch
        {
            "active" or "enrolled" or "a" => "Active",
            "graduated" or "completed" or "g" => "Graduated",
            "withdrawn" or "dropped" or "w" => "Withdrawn",
            "suspended" or "s" => "Suspended",
            _ => "Active"
        };
    }

    /// <summary>
    /// Normalize faculty status string
    /// </summary>
    private static string NormalizeFacultyStatus(string status)
    {
        var lower = status.ToLower().Trim();
        return lower switch
        {
            "active" or "a" => "Active",
            "onleave" or "on leave" or "leave" or "l" => "OnLeave",
            "resigned" or "r" => "Resigned",
            "retired" => "Retired",
            _ => "Active"
        };
    }

    /// <summary>
    /// Parse boolean value from string
    /// </summary>
    private static bool ParseBoolValue(string value)
    {
        var lower = value.ToLower().Trim();
        return lower == "true" || lower == "yes" || lower == "1" || lower == "y" || lower == "active";
    }

    /// <summary>
    /// Parse int value with default fallback
    /// </summary>
    private static int ParseIntValue(string value, int defaultValue)
    {
        return int.TryParse(value, out var result) ? result : defaultValue;
    }

    /// <summary>
    /// Parse DateOnly from cell value
    /// </summary>
    private static DateOnly? ParseDateOnlyValue(IXLCell cell)
    {
        try
        {
            if (cell.Value.IsDateTime)
                return DateOnly.FromDateTime(cell.Value.GetDateTime());
            if (cell.Value.IsBlank)
                return null;
            var text = cell.GetString().Trim();
            if (string.IsNullOrWhiteSpace(text))
                return null;
            if (DateTime.TryParse(text, out var dt))
                return DateOnly.FromDateTime(dt);
            return null;
        }
        catch
        {
            return null;
        }
    }

    #endregion
}

/// <summary>
/// Data class for grade import rows
/// </summary>
public class GradeImportRowData
{
    public int RowNumber { get; set; }
    public string RollNumber { get; set; } = string.Empty;
    public string MarksObtained { get; set; } = string.Empty;
    public bool IsAbsent { get; set; }
    public string? Remarks { get; set; }
}

/// <summary>
/// Data class for attendance import rows
/// </summary>
public class AttendanceImportRowData
{
    public int RowNumber { get; set; }
    public string RollNumber { get; set; } = string.Empty;
    public string Status { get; set; } = "Present";
    public string? Remarks { get; set; }
}

/// <summary>
/// Data class for enrollment import rows
/// </summary>
public class EnrollmentImportRowData
{
    public int RowNumber { get; set; }
    public string RollNumber { get; set; } = string.Empty;
}

/// <summary>
/// Data class for user import rows
/// </summary>
public class UserImportRowData
{
    public int RowNumber { get; set; }
    public string PersonalEmail { get; set; } = string.Empty;
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = "Student";
    public bool IsActive { get; set; } = true;
}

/// <summary>
/// Data class for student import rows
/// </summary>
public class StudentImportRowData
{
    public int RowNumber { get; set; }
    public string PersonalEmail { get; set; } = string.Empty;
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string EnrollmentNumber { get; set; } = string.Empty;
    public int AdmissionYear { get; set; }
    public int CurrentSemester { get; set; }
    public string DepartmentCode { get; set; } = string.Empty;
    public string? BatchName { get; set; }
    public string Status { get; set; } = "Active";
}

/// <summary>
/// Data class for faculty import rows
/// </summary>
public class FacultyImportRowData
{
    public int RowNumber { get; set; }
    public string PersonalEmail { get; set; } = string.Empty;
    public string? InstitutionalEmail { get; set; }
    public string? PhoneNumber { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string DepartmentCode { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public DateOnly? JoiningDate { get; set; }
    public string? Specialization { get; set; }
    public string Status { get; set; } = "Active";
}
