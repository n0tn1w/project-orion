using System.Threading;
using Microsoft.AspNetCore.Mvc;

namespace Web.Api.Endpoints.Auth;

internal sealed class AuthCheck : IEndpoint
{
    public sealed record Request(string Password);

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        WebApplication web = (WebApplication)app;
        string expected = web.Configuration["Auth:Password"]
                          ?? Environment.GetEnvironmentVariable("AUTH_PASSWORD")
                          ?? throw new InvalidOperationException("Set Auth:Password or AUTH_PASSWORD");

        // Need to be in the correct project level
        // dotnet user-secrets init
        // dotnet user-secrets set "Auth:Password" "your-secret"

        // export AUTH_PASSWORD = "your-secret"

        app.MapPost("/auth/check", ([FromBody] Request req) =>
            Results.Ok(req.Password == expected)
        )
        .DisableAntiforgery()
        .WithTags(Tags.Auth);
    }
}
