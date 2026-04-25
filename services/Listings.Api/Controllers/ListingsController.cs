using Listings.Api.Data;
using Listings.Api.Domain;
using MassTransit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shared.Contracts;

namespace Listings.Api.Controllers;

[ApiController]
[Route("listings")]
public class ListingsController(
    ListingsDbContext db,
    IPublishEndpoint publisher,
    IWebHostEnvironment env) : ControllerBase
{
    private static ListingDto ToDto(Listing l) =>
        new(l.Id, l.AuthorId, l.Title, l.Description, l.Price, l.Category, l.CreatedAt, l.Photos);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ListingDto>>> GetAll(
        [FromQuery] string? category, [FromQuery] string? q, CancellationToken ct)
    {
        var query = db.Listings.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(l => l.Category == category);

        var items = await query.OrderByDescending(l => l.CreatedAt).ToListAsync(ct);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var lower = q.ToLower();
            items = items.Where(l =>
                l.Title.ToLower().Contains(lower) ||
                l.Description.ToLower().Contains(lower)).ToList();
        }

        return Ok(items.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ListingDto>> GetById(Guid id, CancellationToken ct)
    {
        var l = await db.Listings.FindAsync([id], ct);
        if (l is null) return NotFound();
        return Ok(ToDto(l));
    }

    [HttpPost]
    public async Task<ActionResult<ListingDto>> Create(CreateListingRequest req, CancellationToken ct)
    {
        var category = Categories.All.Contains(req.Category) ? req.Category : "Другое";
        var entity = new Listing
        {
            Id = Guid.NewGuid(),
            AuthorId = req.AuthorId,
            Title = req.Title,
            Description = req.Description,
            Price = req.Price,
            Category = category,
            CreatedAt = DateTime.UtcNow
        };
        db.Listings.Add(entity);
        await db.SaveChangesAsync(ct);

        await publisher.Publish(
            new ListingCreatedEvent(entity.Id, entity.AuthorId, entity.Title, entity.Price, entity.CreatedAt), ct);

        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, ToDto(entity));
    }

    [HttpPost("{id:guid}/photos")]
    [RequestSizeLimit(50 * 1024 * 1024)]
    public async Task<ActionResult<ListingDto>> UploadPhotos(
        Guid id, IFormFileCollection files, CancellationToken ct)
    {
        var l = await db.Listings.FindAsync([id], ct);
        if (l is null) return NotFound();
        if (files.Count == 0) return BadRequest("No files provided.");

        var uploadsDir = Path.Combine(env.ContentRootPath, "uploads", id.ToString());
        Directory.CreateDirectory(uploadsDir);

        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        foreach (var file in files)
        {
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowed.Contains(ext)) continue;
            var fileName = $"{Guid.NewGuid()}{ext}";
            var path = Path.Combine(uploadsDir, fileName);
            await using var stream = System.IO.File.Create(path);
            await file.CopyToAsync(stream, ct);
            l.Photos.Add($"/media/{id}/{fileName}");
        }

        await db.SaveChangesAsync(ct);
        return Ok(ToDto(l));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var l = await db.Listings.FindAsync([id], ct);
        if (l is null) return NotFound();
        db.Listings.Remove(l);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
