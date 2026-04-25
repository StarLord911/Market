using MassTransit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shared.Contracts;
using Users.Api.Data;
using Users.Api.Domain;

namespace Users.Api.Controllers;

[ApiController]
[Route("users")]
public class UsersController(UsersDbContext db, IPublishEndpoint publisher) : ControllerBase
{
    private static UserDto ToDto(User u) =>
        new(u.Id, u.Username, u.Email, u.Phone, u.Telegram, u.RegisteredAt);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll(CancellationToken ct)
    {
        var items = await db.Users.ToListAsync(ct);
        return Ok(items.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetById(Guid id, CancellationToken ct)
    {
        var u = await db.Users.FindAsync([id], ct);
        if (u is null) return NotFound();
        return Ok(ToDto(u));
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Register(RegisterUserRequest req, CancellationToken ct)
    {
        var emailLower = req.Email.ToLower();
        var exists = await db.Users.AnyAsync(u => u.Email.ToLower() == emailLower, ct);
        if (exists)
            return Conflict(new { error = "Email already registered" });

        var entity = new User
        {
            Id = Guid.NewGuid(),
            Username = req.Username,
            Email = req.Email,
            Phone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone.Trim(),
            Telegram = string.IsNullOrWhiteSpace(req.Telegram) ? null : req.Telegram.TrimStart('@').Trim(),
            RegisteredAt = DateTime.UtcNow
        };
        db.Users.Add(entity);
        await db.SaveChangesAsync(ct);

        await publisher.Publish(
            new UserRegisteredEvent(entity.Id, entity.Username, entity.Email, entity.RegisteredAt), ct);

        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, ToDto(entity));
    }

    [HttpPatch("{id:guid}/contacts")]
    public async Task<ActionResult<UserDto>> UpdateContacts(
        Guid id, UpdateContactsRequest req, CancellationToken ct)
    {
        var u = await db.Users.FindAsync([id], ct);
        if (u is null) return NotFound();

        u.Phone = string.IsNullOrWhiteSpace(req.Phone) ? null : req.Phone.Trim();
        u.Telegram = string.IsNullOrWhiteSpace(req.Telegram) ? null : req.Telegram.TrimStart('@').Trim();
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(u));
    }
}
