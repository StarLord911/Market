namespace Listings.Api.Domain;

public class Comment
{
    public Guid Id { get; set; }
    public Guid ListingId { get; set; }
    public Guid AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public Listing Listing { get; set; } = null!;
}
