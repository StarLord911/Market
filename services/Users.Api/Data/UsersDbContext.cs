using Microsoft.EntityFrameworkCore;
using Users.Api.Domain;

namespace Users.Api.Data;

public class UsersDbContext(DbContextOptions<UsersDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
}
