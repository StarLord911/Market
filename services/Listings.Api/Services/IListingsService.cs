using Microsoft.AspNetCore.Http;
using Shared.Contracts;
using Shared.Contracts.Api;

namespace Listings.Api.Services;

public interface IListingsService
{
    Task<PagedResult<ListingDto>> GetAllAsync(ListingsQuery listingsQuery, CancellationToken ct);
    Task<ListingDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<ListingDto> CreateAsync(CreateListingRequest req, CancellationToken ct);
    Task<ListingDto?> UploadPhotosAsync(Guid id, IFormFileCollection files, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
    Task<ListingDto?> UpdateListingAsync(Guid id, UpdateListingRequest req, CancellationToken ct);
}
