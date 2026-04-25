using Listings.Api.Data;
using Listings.Api.Domain;
using Microsoft.EntityFrameworkCore;
using Shared.Contracts;

namespace Listings.Api.Services;

public class CommentsService : ICommentsService
{
    private readonly ListingsDbContext _db;

    public CommentsService(ListingsDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<CommentDto>> GetByListingAsync(Guid listingId, CancellationToken ct)
    {
        var comments = await _db.Comments
            .Where(c => c.ListingId == listingId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(ct);

        return comments.Select(ToDto);
    }

    public async Task<CommentDto?> CreateAsync(Guid listingId, CreateCommentRequest req, CancellationToken ct)
    {
        var listingExists = await _db.Listings.AnyAsync(l => l.Id == listingId, ct);
        if (!listingExists) return null;

        if (string.IsNullOrWhiteSpace(req.Text)) return null;

        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            ListingId = listingId,
            AuthorId = req.AuthorId,
            AuthorName = req.AuthorName,
            Text = req.Text.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.Comments.Add(comment);
        await _db.SaveChangesAsync(ct);

        return ToDto(comment);
    }

    private static CommentDto ToDto(Comment c) =>
        new(c.Id, c.ListingId, c.AuthorId, c.AuthorName, c.Text, c.CreatedAt);
}
