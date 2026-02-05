using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;

namespace GradeSense.API.Helpers;

/// <summary>
/// Helper class for CSV parsing and generation
/// </summary>
public static class CsvHelperService
{
    /// <summary>
    /// Parse CSV file to list of objects
    /// </summary>
    public static async Task<List<T>> ParseCsvAsync<T>(Stream stream) where T : class
    {
        using var reader = new StreamReader(stream);
        using var csv = new CsvReader(reader, GetCsvConfiguration());
        
        var records = new List<T>();
        await foreach (var record in csv.GetRecordsAsync<T>())
        {
            records.Add(record);
        }
        
        return records;
    }

    /// <summary>
    /// Parse CSV file with error handling per row
    /// </summary>
    public static async Task<(List<T> Records, List<CsvParseError> Errors)> ParseCsvWithErrorsAsync<T>(Stream stream) where T : class
    {
        var records = new List<T>();
        var errors = new List<CsvParseError>();

        using var reader = new StreamReader(stream);
        using var csv = new CsvReader(reader, GetCsvConfiguration());

        // Read header
        await csv.ReadAsync();
        csv.ReadHeader();

        int rowNumber = 1; // Start from 1 (after header)
        while (await csv.ReadAsync())
        {
            rowNumber++;
            try
            {
                var record = csv.GetRecord<T>();
                if (record != null)
                {
                    records.Add(record);
                }
            }
            catch (Exception ex)
            {
                errors.Add(new CsvParseError
                {
                    RowNumber = rowNumber,
                    RawData = csv.Parser.RawRecord,
                    ErrorMessage = ex.Message
                });
            }
        }

        return (records, errors);
    }

    /// <summary>
    /// Generate CSV file from list of objects
    /// </summary>
    public static async Task<byte[]> GenerateCsvAsync<T>(IEnumerable<T> records) where T : class
    {
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream);
        using var csv = new CsvWriter(writer, GetCsvConfiguration());

        await csv.WriteRecordsAsync(records);
        await writer.FlushAsync();

        return memoryStream.ToArray();
    }

    /// <summary>
    /// Generate CSV template with headers only
    /// </summary>
    public static byte[] GenerateCsvTemplate<T>() where T : class
    {
        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream);
        using var csv = new CsvWriter(writer, GetCsvConfiguration());

        csv.WriteHeader<T>();
        csv.NextRecord();
        writer.Flush();

        return memoryStream.ToArray();
    }

    /// <summary>
    /// Generate CSV with sample data for template
    /// </summary>
    public static async Task<byte[]> GenerateCsvWithSampleAsync<T>(IEnumerable<T> sampleRecords) where T : class
    {
        return await GenerateCsvAsync(sampleRecords);
    }

    private static CsvConfiguration GetCsvConfiguration()
    {
        return new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            HeaderValidated = null,
            MissingFieldFound = null,
            TrimOptions = TrimOptions.Trim,
            IgnoreBlankLines = true,
            BadDataFound = null
        };
    }
}

/// <summary>
/// CSV parsing error details
/// </summary>
public class CsvParseError
{
    public int RowNumber { get; set; }
    public string? RawData { get; set; }
    public string ErrorMessage { get; set; } = string.Empty;
}
