using Listings.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Listings.Api.Data;

public class ListingsDbContext(DbContextOptions<ListingsDbContext> options) : DbContext(options)
{
    public DbSet<Listing> Listings => Set<Listing>();
    public DbSet<Comment> Comments => Set<Comment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Listing>(e =>
        {
            e.HasKey(l => l.Id);
            e.Property(l => l.Price).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Comment>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.Text).HasMaxLength(2000);
            e.Property(c => c.AuthorName).HasMaxLength(100);
            e.HasOne(c => c.Listing)
             .WithMany()
             .HasForeignKey(c => c.ListingId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
