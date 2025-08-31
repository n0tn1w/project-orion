
using System.Collections;
using Application.Abstractions.Messaging;
using Application.Files.Download;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;
using Web.Api.Extensions;
using Web.Api.Infrastructure;

namespace Web.Api.Endpoints.Files;

internal sealed class GetByName : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("files/download/{fileName}", async (
            string fileName,
            IQueryHandler<GetFileByNameQuery, FileResponse> handler,
            CancellationToken cancellationToken) =>
        {
            GetFileByNameQuery query = new GetFileByNameQuery(fileName);
            Result<FileResponse> handlerResult = await handler.Handle(query, cancellationToken);
            if (!handlerResult.IsSuccess || handlerResult.Value is null)
            {
                return Results.NotFound();
            }

            IResult a = Results.File(
                fileContents: handlerResult?.Value?.FileData!,
                contentType: handlerResult?.Value?.ContentType!,
                fileDownloadName: handlerResult?.Value?.FileName!
            );
            return a;

        })
        .DisableAntiforgery()
        .WithTags(Tags.Files);
    }

}
