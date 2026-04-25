using Microsoft.AspNetCore.Http;
using Shared.Contracts;

namespace Listings.Api.Services;

public interface IListingsService
{
    Task<IEnumerable<ListingDto>> GetAllAsync(string? category, string? q, CancellationToken ct);
    Task<ListingDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<ListingDto> CreateAsync(CreateListingRequest req, CancellationToken ct);
    Task<ListingDto?> UploadPhotosAsync(Guid id, IFormFileCollection files, CancellationToken ct);
    Task<bool> DeleteAsync(Guid id, CancellationToken ct);
}
