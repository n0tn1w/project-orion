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
            public IFormFileCollection Files { get; set; }
        }

        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("files/upload", async (
                [FromForm] Request request,
                ICommandHandler<UploadFileCommand, string> handler,
                CancellationToken cancellationToken) =>
            {
                List<object> uploaded = new List<object>();

                foreach (IFormFile file in request.Files.ToList())
                {
                    UploadFileCommand command = new UploadFileCommand(
                        file.OpenReadStream(),
                        file.FileName,
                        file.ContentType,
                        file.Length
                    );

                    Result<string> result = await handler.Handle(command, cancellationToken);

                    result.Match(
                        id => { uploaded.Add(new { file = file.FileName, id }); return 0; },
                        err => 0
                    );
                }

                return Results.Ok(new { uploaded });
            })
            .DisableAntiforgery()
            .WithMetadata(new RequestFormLimitsAttribute
            {
                // 12 GB max multipart body
                MultipartBodyLengthLimit = 12L * 1024 * 1024 * 1024
            })
            .WithTags(Tags.Files);
        }
    }
