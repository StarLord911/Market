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
    string City,
    IReadOnlyList<string> Photos);

public record UpdateListingRequest(
    string? Title,
    string? Description,
    decimal? Price,
    string? Category,
    string? City);

public record ListingsQuery(
    int Page = 1,
    int PageSize = 20,
    ListingsSort Sort = ListingsSort.Newest,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    string? Category = null,
    string? City = null,
    string? Q = null);

// Запрос на создание нового объявления
public record CreateListingRequest(
    Guid AuthorId,
    string Title,
    string Description,
    decimal Price,
    string Category,
    string City);

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

public enum ListingsSort
{
    Newest,
    PriceAsc,
    PriceDesc
}
