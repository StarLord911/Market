using Shared.Contracts;

namespace Listings.Api.Services;

public interface ICommentsService
{
    Task<IEnumerable<CommentDto>> GetByListingAsync(Guid listingId, CancellationToken ct);
    Task<CommentDto?> CreateAsync(Guid listingId, CreateCommentRequest req, CancellationToken ct);
}
