using MassTransit;
using Shared.Contracts;

namespace Listings.Api.Consumers;

public class UserRegisteredConsumer(ILogger<UserRegisteredConsumer> logger)
    : IConsumer<UserRegisteredEvent>
{
    public Task Consume(ConsumeContext<UserRegisteredEvent> context)
    {
        var msg = context.Message;
        logger.LogInformation(
            "User registered: {UserId} ({Username}, {Email}) at {RegisteredAt}",
            msg.UserId, msg.Username, msg.Email, msg.RegisteredAt);
        return Task.CompletedTask;
    }
}
