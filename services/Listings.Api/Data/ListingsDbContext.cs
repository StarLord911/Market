using Listings.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Listings.Api.Data;

public class ListingsDbContext(DbContextOptions<ListingsDbContext> options) : DbContext(options)
{
    public DbSet<Listing> Listings => Set<Listing>();
}
