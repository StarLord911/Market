namespace Listings.Api.Domain;

// Объявление на доске
public class Listing
{
    // Уникальный идентификатор объявления
    public Guid Id { get; set; }

    // Идентификатор пользователя, создавшего объявление
    public Guid AuthorId { get; set; }

    // Заголовок объявления
    public string Title { get; set; } = string.Empty;

    // Подробное описание товара или услуги
    public string Description { get; set; } = string.Empty;

    // Цена в рублях
    public decimal Price { get; set; }

    // Категория — должна совпадать с одним из значений в Categories.All
    public string Category { get; set; } = "Другое";

    // Дата и время публикации (UTC)
    public DateTime CreatedAt { get; set; }

    // Пути к загруженным фотографиям (относительные URL вида /media/{id}/{file})
    public List<string> Photos { get; set; } = [];
}
