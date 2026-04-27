using Listings.Api.Data;
using Listings.Api.Domain;
using MassTransit;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Shared.Contracts;
using Shared.Contracts.Api;

namespace Listings.Api.Services;

public class ListingsService : IListingsService
{
    private readonly ListingsDbContext _db;
    private readonly IPublishEndpoint _publisher;
    private readonly IWebHostEnvironment _env;

    public ListingsService(ListingsDbContext db, IPublishEndpoint publisher, IWebHostEnvironment env)
    {
        _db = db;
        _publisher = publisher;
        _env = env;
    }

    public async Task<PagedResult<ListingDto>> GetAllAsync(ListingsQuery listingsQuery, CancellationToken ct)
    {
        var query = _db.Listings
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(listingsQuery.Category))
            query = query.Where(l => l.Category == listingsQuery.Category);

        if (!string.IsNullOrWhiteSpace(listingsQuery.City))
            query = query.Where(l => l.City == listingsQuery.City);

        if (listingsQuery.MinPrice.HasValue)
            query = query.Where(l => l.Price >= listingsQuery.MinPrice.Value);

        if (listingsQuery.MaxPrice.HasValue)
            query = query.Where(l => l.Price <= listingsQuery.MaxPrice.Value);

        if (!string.IsNullOrWhiteSpace(listingsQuery.Q))
        {
            var search = listingsQuery.Q.Trim();
            query = query.Where(l =>
                EF.Functions.Like(l.Title, $"%{search}%") ||
                EF.Functions.Like(l.Description, $"%{search}%"));
        }

        switch (listingsQuery.Sort)
        {
            case ListingsSort.Newest:
                query = query.OrderByDescending(l => l.CreatedAt);
                break;
            case ListingsSort.PriceDesc:
                query = query.OrderByDescending(l => l.Price);
                break;
            case ListingsSort.PriceAsc:
                query = query.OrderBy(l => l.Price);
                break;
        }

        var total = await query.CountAsync(ct);

        var items = await query.Skip((listingsQuery.Page - 1) * listingsQuery.PageSize)
            .Take(listingsQuery.PageSize).ToListAsync(ct);

        return new PagedResult<ListingDto>(
            items.Select(ToDto).ToList(),
            listingsQuery.Page,
            listingsQuery.PageSize,
            total);
    }

    public async Task<ListingDto?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var l = await _db.Listings.FindAsync(id, ct);
        return l is null ? null : ToDto(l);
    }

    public async Task<ListingDto> CreateAsync(CreateListingRequest req, CancellationToken ct)
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
            CreatedAt = DateTime.UtcNow,
            City = req.City,
        };
        _db.Listings.Add(entity);
        await _db.SaveChangesAsync(ct);

        await _publisher.Publish(
            new ListingCreatedEvent(entity.Id, entity.AuthorId, entity.Title, entity.Price, entity.CreatedAt), ct);

        return ToDto(entity);
    }

    public async Task<ListingDto?> UploadPhotosAsync(Guid id, IFormFileCollection files, CancellationToken ct)
    {
        var l = await _db.Listings.FindAsync(id, ct);
        if (l is null) return null;

        var uploadsDir = Path.Combine(_env.ContentRootPath, "uploads", id.ToString());
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

        await _db.SaveChangesAsync(ct);
        return ToDto(l);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken ct)
    {
        var l = await _db.Listings.FindAsync(id, ct);
        if (l is null) return false;
        _db.Listings.Remove(l);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<ListingDto?> UpdateListingAsync(Guid id, UpdateListingRequest req, CancellationToken ct)
    {
        var listing = await _db.Listings.FindAsync(id, ct);

        if (listing == null)
        {
            return null;
        }

        if (!string.IsNullOrEmpty(req.Title)) listing.Title = req.Title;
        if (!string.IsNullOrEmpty(req.Description)) listing.Description = req.Description;
        if (req.Price.HasValue) listing.Price = req.Price.Value;
        if (!string.IsNullOrEmpty(req.City)) listing.City = req.City;

        if (!string.IsNullOrEmpty(req.Category) && Categories.All.Contains(req.Category))
            listing.Category = req.Category;

        await _db.SaveChangesAsync(ct);

        return ToDto(listing);
    }

    private static ListingDto ToDto(Listing l) =>
        new(l.Id, l.AuthorId, l.Title, l.Description, l.Price, l.Category, l.CreatedAt, l.City, l.Photos);

}
