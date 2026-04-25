namespace Shared.Contracts;

// Событие: новый пользователь зарегистрировался
public record UserRegisteredEvent(
    Guid UserId,
    string Username,
    string Email,
    DateTime RegisteredAt);

// Событие: новое объявление опубликовано
public record ListingCreatedEvent(
    Guid ListingId,
    Guid AuthorId,
    string Title,
    decimal Price,
    DateTime CreatedAt);
