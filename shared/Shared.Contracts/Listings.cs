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

// DTO комментария к объявлению
public record CommentDto(
    Guid Id,
    Guid ListingId,
    Guid AuthorId,
    string AuthorName,
    string Text,
    DateTime CreatedAt);

// Запрос на добавление комментария
public record CreateCommentRequest(
    Guid AuthorId,
    string AuthorName,
    string Text);

// Запрос на добавление объявления в избранное
public record AddFavoriteRequest(Guid UserId);
