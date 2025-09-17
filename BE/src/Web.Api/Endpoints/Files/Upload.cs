using System.Text;
using Application.Abstractions.Messaging;
using Application.Files.Upload;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;
using Web.Api.Extensions;
using Web.Api.Infrastructure;
using static System.Net.Mime.MediaTypeNames;

namespace Web.Api.Endpoints.Files;

internal sealed class Upload : IEndpoint
{
    public sealed class Request 
    {
        public IFormFile FileStream { get; set; }
    }

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("files/upload", async (
            [FromForm] Request request,
            ICommandHandler<UploadFileCommand, string> handler,
            CancellationToken cancellationToken) =>
        {
            UploadFileCommand command = new UploadFileCommand(
                request.FileStream.OpenReadStream(),
                request.FileStream.FileName,
                request.FileStream.ContentType,
                request.FileStream.Length
                );
            Result<string> result = await handler.Handle(command, cancellationToken);

            return result.Match(Results.Ok, CustomResults.Problem);
        })
        .DisableAntiforgery()
        .WithMetadata(new RequestFormLimitsAttribute 
        {
            MultipartBodyLengthLimit = 12L * 1024 * 1024 * 1024
        })
        .WithTags(Tags.Files);
    }
}
