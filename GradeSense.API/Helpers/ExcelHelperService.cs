using ClosedXML.Excel;
using System.Reflection;

namespace GradeSense.API.Helpers;

/// <summary>
/// Helper class for Excel generation using ClosedXML
/// </summary>
public static class ExcelHelperService
{
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
            
            var dataType = data.GetType();
            if (dataType.IsGenericType && dataType.GetGenericTypeDefinition() == typeof(List<>))
            {
                var elementType = dataType.GetGenericArguments()[0];
                var method = typeof(ExcelHelperService).GetMethod(nameof(AddSheet), BindingFlags.NonPublic | BindingFlags.Static);
                var genericMethod = method!.MakeGenericMethod(elementType);
                genericMethod.Invoke(null, new object[] { workbook, sheetName, data });
            }
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
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
}
