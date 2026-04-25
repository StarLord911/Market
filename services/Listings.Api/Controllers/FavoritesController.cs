using Listings.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Shared.Contracts;

namespace Listings.Api.Controllers;

[ApiController]
public class FavoritesController : ControllerBase
{
    private readonly IFavoritesService _service;

    public FavoritesController(IFavoritesService service)
    {
        _service = service;
    }

    [HttpGet("listings/favorites/{userId:guid}")]
    public async Task<ActionResult<IEnumerable<ListingDto>>> GetByUser(Guid userId, CancellationToken ct)
    {
        var items = await _service.GetByUserAsync(userId, ct);
        return Ok(items);
    }

    [HttpPost("listings/{listingId:guid}/favorites")]
    public async Task<IActionResult> Add(Guid listingId, [FromBody] AddFavoriteRequest req, CancellationToken ct)
    {
        var ok = await _service.AddAsync(listingId, req.UserId, ct);
        if (!ok) return NotFound();
        return StatusCode(201);
    }

    [HttpDelete("listings/{listingId:guid}/favorites/{userId:guid}")]
    public async Task<IActionResult> Remove(Guid listingId, Guid userId, CancellationToken ct)
    {
        await _service.RemoveAsync(listingId, userId, ct);
        return NoContent();
    }
}
