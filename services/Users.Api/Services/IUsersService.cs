using Shared.Contracts;

namespace Users.Api.Services;

public interface IUsersService
{
    Task<IEnumerable<UserDto>> GetAllAsync(CancellationToken ct);
    Task<UserDto?> GetByIdAsync(Guid id, CancellationToken ct);
    Task<(UserDto? Dto, bool EmailConflict)> RegisterAsync(RegisterUserRequest req, CancellationToken ct);
    Task<UserDto?> UpdateContactsAsync(Guid id, UpdateContactsRequest req, CancellationToken ct);
}
