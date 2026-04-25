using Listings.Api.Consumers;
using Listings.Api.Data;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ListingsDbContext>(opt =>
    opt.UseInMemoryDatabase("listings"));

builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<UserRegisteredConsumer>();

    x.UsingRabbitMq((ctx, cfg) =>
    {
        var host = builder.Configuration["RabbitMq:Host"] ?? "localhost";
        cfg.Host(host, "/", h =>
        {
            h.Username(builder.Configuration["RabbitMq:User"] ?? "guest");
            h.Password(builder.Configuration["RabbitMq:Pass"] ?? "guest");
        });

        cfg.ReceiveEndpoint("listings.user-registered", e =>
        {
            e.ConfigureConsumer<UserRegisteredConsumer>(ctx);
        });
    });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
    app.MapOpenApi();

// Serve uploaded photos at /media/**
var uploadsRoot = Path.Combine(app.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsRoot);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsRoot),
    RequestPath = "/media"
});

app.MapControllers();
app.Run();
