using Shared.Contracts;

namespace Listings.Api.Services;

public interface IFavoritesService
{
    Task<IEnumerable<ListingDto>> GetByUserAsync(Guid userId, CancellationToken ct);
    Task<bool> AddAsync(Guid listingId, Guid userId, CancellationToken ct);
    Task<bool> RemoveAsync(Guid listingId, Guid userId, CancellationToken ct);
}
