namespace GradeSense.API.DTOs.Common;

/// <summary>
/// Response for bulk operations (import/export)
/// </summary>
public class BulkOperationResponse<T>
{
    public int TotalRecords { get; set; }
    public int SuccessCount { get; set; }
    public int ErrorCount { get; set; }
    public List<T> SuccessfulRecords { get; set; } = new();
    public List<BulkOperationError> Errors { get; set; } = new();
    public bool IsSuccess => ErrorCount == 0;
    public string Summary => $"Processed {TotalRecords} records: {SuccessCount} succeeded, {ErrorCount} failed";
}

/// <summary>
/// Error details for bulk operation failures
/// </summary>
public class BulkOperationError
{
    public int RowNumber { get; set; }
    public string? Identifier { get; set; }
    public string ErrorMessage { get; set; } = string.Empty;
    public Dictionary<string, string>? FieldErrors { get; set; }
}
