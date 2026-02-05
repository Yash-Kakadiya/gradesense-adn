using Microsoft.EntityFrameworkCore;
using GradeSense.API.Data;
using GradeSense.API.Models;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.DTOs.User.Request;

namespace GradeSense.API.Repositories;

public class UserRepository : IUserRepository
{
    private readonly GradeSenseDbContext _context;

    public UserRepository(GradeSenseDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.Faculty)
                .ThenInclude(f => f.Department)
            .Include(u => u.Student)
                .ThenInclude(s => s.Department)
            .FirstOrDefaultAsync(u => u.Id == id && u.DeletedAt == null);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        // Search in both PersonalEmail and InstitutionalEmail
        return await _context.Users
            .Include(u => u.Faculty)
                .ThenInclude(f => f.Department)
            .Include(u => u.Student)
                .ThenInclude(s => s.Department)
            .FirstOrDefaultAsync(u => 
                (u.PersonalEmail == email || u.InstitutionalEmail == email) 
                && u.DeletedAt == null);
    }

    public async Task<(List<User> Users, int TotalCount)> GetAllAsync(UserFilterRequest filter)
    {
        var query = _context.Users
            .Include(u => u.Faculty)
            .Include(u => u.Student)
            .Where(u => u.DeletedAt == null)
            .AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var searchTerm = filter.SearchTerm.ToLower();
            query = query.Where(u =>
                u.PersonalEmail.ToLower().Contains(searchTerm) ||
                (u.InstitutionalEmail != null && u.InstitutionalEmail.ToLower().Contains(searchTerm)) ||
                (u.PhoneNumber != null && u.PhoneNumber.Contains(searchTerm)) ||
                u.FullName.ToLower().Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(filter.Role))
        {
            query = query.Where(u => u.Role == filter.Role);
        }

        if (filter.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == filter.IsActive.Value);
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync();

        // Apply sorting
        query = filter.SortOrder.ToLower() == "desc"
            ? query.OrderByDescending(u => EF.Property<object>(u, filter.SortBy))
            : query.OrderBy(u => EF.Property<object>(u, filter.SortBy));

        // Apply pagination
        var users = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return (users, totalCount);
    }

    public async Task<User> CreateAsync(User user)
    {
        user.CreatedAt = DateTime.Now;
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User> UpdateAsync(User user)
    {
        user.UpdatedAt = DateTime.Now;
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        // Soft delete
        user.DeletedAt = DateTime.Now;
        user.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await _context.Users.AnyAsync(u => u.Id == id && u.DeletedAt == null);
    }

    public async Task<bool> PersonalEmailExistsAsync(string email, int? excludeUserId = null)
    {
        var query = _context.Users.Where(u => u.PersonalEmail == email && u.DeletedAt == null);

        if (excludeUserId.HasValue)
        {
            query = query.Where(u => u.Id != excludeUserId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> InstitutionalEmailExistsAsync(string email, int? excludeUserId = null)
    {
        var query = _context.Users.Where(u => u.InstitutionalEmail == email && u.DeletedAt == null);

        if (excludeUserId.HasValue)
        {
            query = query.Where(u => u.Id != excludeUserId.Value);
        }

        return await query.AnyAsync();
    }

    public async Task<bool> PhoneNumberExistsAsync(string phoneNumber, int? excludeUserId = null)
    {
        var query = _context.Users.Where(u => u.PhoneNumber == phoneNumber && u.DeletedAt == null);

        if (excludeUserId.HasValue)
        {
            query = query.Where(u => u.Id != excludeUserId.Value);
        }

        return await query.AnyAsync();
    }
}