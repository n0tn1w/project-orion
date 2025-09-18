
using System.Collections;
using Application.Abstractions.Messaging;
using Application.Files.Download;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;
using Web.Api.Extensions;
using Web.Api.Infrastructure;

namespace Web.Api.Endpoints.Files;

internal sealed class Download : IEndpoint
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

            FileResponse f = handlerResult.Value;

            return Results.File(
                fileStream: f.Stream,
                contentType: f.ContentType,
                fileDownloadName: f.FileName,
                lastModified: f.LastModified,
                enableRangeProcessing: true
            );

        })
        .DisableAntiforgery()
        .WithTags(Tags.Files);
    }

}
