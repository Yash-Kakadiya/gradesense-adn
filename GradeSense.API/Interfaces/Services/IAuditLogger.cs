namespace GradeSense.API.Interfaces.Services;

/// <summary>
/// Interface for centralized audit logging
/// </summary>
public interface IAuditLogger
{
    /// <summary>
    /// Log an action for audit trail
    /// </summary>
    /// <param name="action">Action performed (Create, Update, Delete, Login, etc.)</param>
    /// <param name="entityName">Name of the entity (User, Department, Student, etc.)</param>
    /// <param name="entityId">ID of the entity</param>
    /// <param name="details">Additional details about the action</param>
    /// <param name="oldValue">Previous value (for updates)</param>
    /// <param name="newValue">New value (for updates)</param>
    /// <param name="changedFields">Comma-separated list of changed field names</param>
    Task LogAsync(string action, string entityName, string entityId, string? details = null, string? oldValue = null, string? newValue = null, string? changedFields = null);

    /// <summary>
    /// Log an action for audit trail with specific actor user ID (for login events)
    /// </summary>
    /// <param name="action">Action performed</param>
    /// <param name="entityName">Name of the entity</param>
    /// <param name="entityId">ID of the entity</param>
    /// <param name="actorUserId">ID of the user performing the action</param>
    /// <param name="details">Additional details about the action</param>
    Task LogWithActorAsync(string action, string entityName, string entityId, int actorUserId, string? details = null);

    /// <summary>
    /// Log an update action with automatic change detection (comparing objects by property names)
    /// </summary>
    /// <param name="entityName">Name of the entity</param>
    /// <param name="entityId">ID of the entity</param>
    /// <param name="oldEntity">Entity before update (can be any object)</param>
    /// <param name="newEntity">Entity after update (can be any object, properties matched by name)</param>
    /// <param name="details">Additional details</param>
    Task LogUpdateAsync(string entityName, string entityId, object oldEntity, object newEntity, string? details = null);
}
