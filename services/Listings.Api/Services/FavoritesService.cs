using Listings.Api.Data;
using Listings.Api.Domain;
using Microsoft.EntityFrameworkCore;
using Shared.Contracts;

namespace Listings.Api.Services;

public class FavoritesService : IFavoritesService
{
    private readonly ListingsDbContext _db;

    public FavoritesService(ListingsDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ListingDto>> GetByUserAsync(Guid userId, CancellationToken ct)
    {
        var listings = await _db.Favorites
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.AddedAt)
            .Include(f => f.Listing)
            .Select(f => f.Listing)
            .ToListAsync(ct);

        return listings.Select(ToDto);
    }

    public async Task<bool> AddAsync(Guid listingId, Guid userId, CancellationToken ct)
    {
        var listingExists = await _db.Listings.AnyAsync(l => l.Id == listingId, ct);
        if (!listingExists) return false;

        var already = await _db.Favorites.AnyAsync(f => f.UserId == userId && f.ListingId == listingId, ct);
        if (already) return true;

        _db.Favorites.Add(new Favorite { UserId = userId, ListingId = listingId, AddedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> RemoveAsync(Guid listingId, Guid userId, CancellationToken ct)
    {
        var fav = await _db.Favorites.FindAsync([userId, listingId], ct);
        if (fav is null) return false;
        _db.Favorites.Remove(fav);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    private static ListingDto ToDto(Listing l) =>
        new(l.Id, l.AuthorId, l.Title, l.Description, l.Price, l.Category, l.CreatedAt, l.Photos);
}
