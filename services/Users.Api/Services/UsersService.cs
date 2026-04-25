using MassTransit;
using Microsoft.EntityFrameworkCore;
using Shared.Contracts;
using Users.Api.Data;
using Users.Api.Domain;

namespace Users.Api.Services;

public class UsersService : IUsersService
{
    private readonly UsersDbContext _db;
    private readonly IPublishEndpoint _publisher;

    public UsersService(UsersDbContext db, IPublishEndpoint publisher)
    {
        _db = db;
        _publisher = publisher;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync(CancellationToken ct)
    {
        var items = await _db.Users.ToListAsync(ct);
        return items.Select(ToDto);
    }

    public async Task<UserDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var u = await _db.Users.FindAsync(id, ct);
        return u is null ? null : ToDto(u);
    }

    public async Task<(UserDto? Dto, bool EmailConflict)> RegisterAsync(RegisterUserRequest req, CancellationToken ct)
    {
        var emailLower = req.Email.ToLower();
        var exists = await _db.Users.AnyAsync(u => u.Email.ToLower() == emailLower, ct);
        if (exists) return (null, true);

        var entity = new User
        {
            Id = Guid.NewGuid(),
            Username = req.Username,
            Email = req.Email,
            Phone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone.Trim(),
            Telegram = string.IsNullOrWhiteSpace(req.Telegram) ? null : req.Telegram.TrimStart('@').Trim(),
            RegisteredAt = DateTime.UtcNow
        };
        _db.Users.Add(entity);
        await _db.SaveChangesAsync(ct);

        await _publisher.Publish(
            new UserRegisteredEvent(entity.Id, entity.Username, entity.Email, entity.RegisteredAt), ct);

        return (ToDto(entity), false);
    }

    public async Task<UserDto?> UpdateContactsAsync(Guid id, UpdateContactsRequest req, CancellationToken ct)
    {
        var u = await _db.Users.FindAsync(id, ct);
        if (u is null) return null;

        u.Phone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone.Trim();
        u.Telegram = string.IsNullOrWhiteSpace(req.Telegram) ? null : req.Telegram.TrimStart('@').Trim();
        await _db.SaveChangesAsync(ct);

        return ToDto(u);
    }

    private static UserDto ToDto(User u) =>
        new(u.Id, u.Username, u.Email, u.Phone, u.Telegram, u.RegisteredAt);
}
