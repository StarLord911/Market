namespace Shared.Contracts;

// DTO пользователя — передаётся клиенту и между сервисами
public record UserDto(
    Guid Id,
    string Username,
    string Email,
    string? Phone,
    string? Telegram,
    DateTime RegisteredAt);

// Запрос на регистрацию нового пользователя
public record RegisterUserRequest(
    string Username,
    string Email,
    string? Phone = null,
    string? Telegram = null);

// Запрос на обновление контактных данных пользователя
public record UpdateContactsRequest(
    string? Phone,
    string? Telegram);
