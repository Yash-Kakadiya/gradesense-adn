using GradeSense.API.Data;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;
using System.Security.Claims;
using System.Text.Json;
using System.Reflection;

namespace GradeSense.API.Services;

/// <summary>
/// Centralized audit logging service
/// </summary>
public class AuditLogger : IAuditLogger
{
    private readonly GradeSenseDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<AuditLogger> _logger;

    // Properties to exclude from change tracking (common in all entities)
    private static readonly HashSet<string> ExcludedProperties = new(StringComparer.OrdinalIgnoreCase)
    {
        "CreatedAt", "UpdatedAt", "DeletedAt", "PasswordHash"
    };

    public AuditLogger(
        GradeSenseDbContext context,
        IHttpContextAccessor httpContextAccessor,
        ILogger<AuditLogger> logger)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    /// <summary>
    /// Gets the real client IP address, checking forwarded headers first
    /// </summary>
    private string? GetClientIpAddress(HttpContext? httpContext)
    {
        if (httpContext == null) return null;

        // Check X-Forwarded-For header (used by proxies/load balancers)
        var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            // X-Forwarded-For can contain multiple IPs, take the first one (original client)
            var ip = forwardedFor.Split(',').FirstOrDefault()?.Trim();
            if (!string.IsNullOrEmpty(ip)) return ip;
        }

        // Check X-Real-IP header (used by Nginx)
        var realIp = httpContext.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrEmpty(realIp)) return realIp;

        // Fall back to RemoteIpAddress, convert IPv6 loopback to IPv4
        var remoteIp = httpContext.Connection.RemoteIpAddress;
        if (remoteIp != null)
        {
            // Convert ::1 (IPv6 loopback) to 127.0.0.1
            if (remoteIp.IsIPv4MappedToIPv6)
                return remoteIp.MapToIPv4().ToString();
            if (remoteIp.ToString() == "::1")
                return "127.0.0.1";
            return remoteIp.ToString();
        }

        return null;
    }

    public async Task LogAsync(string action, string entityName, string entityId, string? details = null, string? oldValue = null, string? newValue = null, string? changedFields = null)
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var userIdClaim = httpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var actorUserId = int.TryParse(userIdClaim, out int userId) ? userId : 1;

            var auditLog = new AuditLog
            {
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                ActorUserId = actorUserId,
                OccurredAt = DateTime.Now,
                CreatedAt = DateTime.Now,
                Ipaddress = GetClientIpAddress(httpContext),
                UserAgent = httpContext?.Request?.Headers["User-Agent"].ToString(),
                Reason = details,
                OldValue = oldValue,
                NewValue = newValue,
                ChangedFields = changedFields
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Audit log created: {Action} on {EntityName} ({EntityId}) by user {UserId}",
                action, entityName, entityId, actorUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create audit log for {Action} on {EntityName}", action, entityName);
        }
    }

    public async Task LogWithActorAsync(string action, string entityName, string entityId, int actorUserId, string? details = null)
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;

            var auditLog = new AuditLog
            {
                Action = action,
                EntityName = entityName,
                EntityId = entityId,
                ActorUserId = actorUserId,
                OccurredAt = DateTime.Now,
                CreatedAt = DateTime.Now,
                Ipaddress = GetClientIpAddress(httpContext),
                UserAgent = httpContext?.Request?.Headers["User-Agent"].ToString(),
                Reason = details
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Audit log created: {Action} on {EntityName} ({EntityId}) by user {UserId}",
                action, entityName, entityId, actorUserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create audit log for {Action} on {EntityName}", action, entityName);
        }
    }

    public async Task LogUpdateAsync(string entityName, string entityId, object oldEntity, object newEntity, string? details = null)
    {
        try
        {
            var changes = GetChanges(oldEntity, newEntity);
            
            if (changes.ChangedFields.Count == 0)
            {
                _logger.LogDebug("No changes detected for {EntityName} ({EntityId}), skipping audit log", entityName, entityId);
                return;
            }

            var oldValueJson = JsonSerializer.Serialize(changes.OldValues, new JsonSerializerOptions { WriteIndented = false });
            var newValueJson = JsonSerializer.Serialize(changes.NewValues, new JsonSerializerOptions { WriteIndented = false });
            var changedFieldsList = string.Join(",", changes.ChangedFields);

            await LogAsync("Update", entityName, entityId, details, oldValueJson, newValueJson, changedFieldsList);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to log update for {EntityName} ({EntityId})", entityName, entityId);
            // Fallback to simple logging without change tracking
            await LogAsync("Update", entityName, entityId, details);
        }
    }

    private (List<string> ChangedFields, Dictionary<string, object?> OldValues, Dictionary<string, object?> NewValues) GetChanges(object oldEntity, object newEntity)
    {
        var changedFields = new List<string>();
        var oldValues = new Dictionary<string, object?>();
        var newValues = new Dictionary<string, object?>();

        if (oldEntity == null || newEntity == null)
            return (changedFields, oldValues, newValues);

        // Get properties from both objects and match by name
        var oldType = oldEntity.GetType();
        var newType = newEntity.GetType();
        
        var oldProperties = oldType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.CanRead && !ExcludedProperties.Contains(p.Name))
            .ToDictionary(p => p.Name, p => p);
        
        var newProperties = newType.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p.CanRead && !ExcludedProperties.Contains(p.Name))
            .ToDictionary(p => p.Name, p => p);

        // Compare properties that exist in both objects
        foreach (var oldProp in oldProperties)
        {
            if (!newProperties.TryGetValue(oldProp.Key, out var newProp))
                continue;

            try
            {
                var oldValue = oldProp.Value.GetValue(oldEntity);
                var newValue = newProp.GetValue(newEntity);

                // Skip navigation properties and collections
                var propType = oldProp.Value.PropertyType;
                if (propType.IsClass && propType != typeof(string) && !propType.IsArray && !propType.IsPrimitive && propType != typeof(decimal))
                    continue;

                if (!AreValuesEqual(oldValue, newValue))
                {
                    changedFields.Add(oldProp.Key);
                    oldValues[oldProp.Key] = oldValue;
                    newValues[oldProp.Key] = newValue;
                }
            }
            catch
            {
                // Skip properties that can't be read
            }
        }

        return (changedFields, oldValues, newValues);
    }

    private static bool AreValuesEqual(object? oldValue, object? newValue)
    {
        if (oldValue == null && newValue == null)
            return true;
        if (oldValue == null || newValue == null)
            return false;
        return oldValue.Equals(newValue);
    }
}
