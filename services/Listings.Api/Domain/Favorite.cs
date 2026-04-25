namespace Listings.Api.Domain;

public class Favorite
{
    public Guid UserId { get; set; }
    public Guid ListingId { get; set; }
    public DateTime AddedAt { get; set; }

    public Listing Listing { get; set; } = null!;
}
