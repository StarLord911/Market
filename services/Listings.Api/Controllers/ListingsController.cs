using Listings.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Shared.Contracts;
using Shared.Contracts.Api;

namespace Listings.Api.Controllers;

[ApiController]
[Route("listings")]
public class ListingsController : ControllerBase
{
    private readonly IListingsService _service;

    public ListingsController(IListingsService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ListingDto>>> GetAll([FromQuery] ListingsQuery listingsQuery,  CancellationToken ct)
    {
        if (listingsQuery.Page < 1)
            return BadRequest(new { error = "Page must be greater than or equal to 1." });

        if (listingsQuery.PageSize is < 1 or > 100)
            return BadRequest(new { error = "PageSize must be between 1 and 100." });

        if (listingsQuery.MinPrice.HasValue && listingsQuery.MinPrice.Value < 0)
            return BadRequest(new { error = "MinPrice must be non-negative." });

        if (listingsQuery.MaxPrice.HasValue && listingsQuery.MaxPrice.Value < 0)
            return BadRequest(new { error = "MaxPrice must be non-negative." });

        if (listingsQuery.MinPrice.HasValue && listingsQuery.MaxPrice.HasValue &&
            listingsQuery.MinPrice.Value > listingsQuery.MaxPrice.Value)
            return BadRequest(new { error = "MinPrice cannot be greater than MaxPrice." });

        var items = await _service.GetAllAsync(listingsQuery, ct);
        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ListingDto>> GetById(Guid id, CancellationToken ct)
    {
        var dto = await _service.GetByIdAsync(id, ct);
        if (dto is null) return NotFound();
        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ListingDto>> Create(CreateListingRequest req, CancellationToken ct)
    {
        var dto = await _service.CreateAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPost("{id:guid}/photos")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<ActionResult<ListingDto>> UploadPhotos(
        Guid id, IFormFileCollection files, CancellationToken ct)
    {
        if (files.Count == 0) return BadRequest("No files provided.");
        var dto = await _service.UploadPhotosAsync(id, files, ct);
        if (dto is null) return NotFound();
        return Ok(dto);
    }
   
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var deleted = await _service.DeleteAsync(id, ct);
        if (!deleted) return NotFound();
        return NoContent();
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<ListingDto>> UpdateListing(Guid id, UpdateListingRequest updateListingRequest, CancellationToken ct)
    {
        var updatedDto = await _service.UpdateListingAsync(id, updateListingRequest, ct);

        if (updatedDto is null) return NotFound();

        return Ok(updatedDto);
    }
}
