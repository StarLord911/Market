using Listings.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Shared.Contracts;

namespace Listings.Api.Controllers;

[ApiController]
[Route("listings/{listingId:guid}/comments")]
public class CommentsController : ControllerBase
{
    private readonly ICommentsService _service;

    public CommentsController(ICommentsService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CommentDto>>> GetAll(Guid listingId, CancellationToken ct)
    {
        var comments = await _service.GetByListingAsync(listingId, ct);
        return Ok(comments);
    }

    [HttpPost]
    public async Task<ActionResult<CommentDto>> Create(
        Guid listingId, CreateCommentRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Text))
            return BadRequest(new { error = "Текст комментария не может быть пустым" });

        var dto = await _service.CreateAsync(listingId, req, ct);
        if (dto is null) return NotFound();

        return StatusCode(201, dto);
    }
}
