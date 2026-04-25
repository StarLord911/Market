using Microsoft.AspNetCore.Mvc;
using Shared.Contracts;
using Users.Api.Services;

namespace Users.Api.Controllers;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    private readonly IUsersService _service;

    public UsersController(IUsersService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll(CancellationToken ct)
    {
        var items = await _service.GetAllAsync(ct);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        if (dto is null) return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Register(RegisterUserRequest req, CancellationToken ct)
    {
        var (dto, emailConflict) = await _service.RegisterAsync(req, ct);
        if (emailConflict) return Conflict(new { error = "Email already registered" });
        return CreatedAtAction(nameof(GetById), new { id = dto!.Id }, dto);
    }

    [HttpPatch("{id:guid}/contacts")]
    public async Task<ActionResult<UserDto>> UpdateContacts(
        Guid id, UpdateContactsRequest req, CancellationToken ct)
    {
        var dto = await _service.UpdateContactsAsync(id, req, ct);
        if (dto is null) return NotFound();
        return Ok(dto);
    }
}
