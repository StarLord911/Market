namespace Shared.Contracts;

// DTO объявления — передаётся клиенту и между сервисами
public record ListingDto(
    Guid Id,
    Guid AuthorId,
    string Title,
    string Description,
    decimal Price,
    string Category,
    DateTime CreatedAt,
    IReadOnlyList<string> Photos);

// Запрос на создание нового объявления
public record CreateListingRequest(
    Guid AuthorId,
    string Title,
    string Description,
    decimal Price,
    string Category);
