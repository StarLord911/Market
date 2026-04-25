namespace Users.Api.Domain;

// Пользователь сервиса
public class User
{
    // Уникальный идентификатор пользователя
    public Guid Id { get; set; }

    // Отображаемое имя (никнейм)
    public string Username { get; set; } = string.Empty;

    // Адрес электронной почты — уникален в системе
    public string Email { get; set; } = string.Empty;

    // Номер телефона для связи (необязательно)
    public string? Phone { get; set; }

    // Имя пользователя в Telegram без символа @ (необязательно)
    public string? Telegram { get; set; }

    // Дата и время регистрации (UTC)
    public DateTime RegisteredAt { get; set; }
}
