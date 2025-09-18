using System.Collections;
using Application.Abstractions.Messaging;
using Application.Files.Delete;
using Application.Files.Download;
using Microsoft.AspNetCore.Mvc;
using SharedKernel;
using Web.Api.Extensions;
using Web.Api.Infrastructure;

namespace Web.Api.Endpoints.Files;

internal sealed class Delete : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("files/delete/{fileName}", async (
            string fileName,
            IQueryHandler<DeleteFileByNameQuery, bool> handler,
            CancellationToken cancellationToken) =>
        {
            DeleteFileByNameQuery query = new DeleteFileByNameQuery(fileName);
            Result<bool> handlerResult = await handler.Handle(query, cancellationToken);

            return handlerResult;
        })
        .DisableAntiforgery()
        .WithTags(Tags.Files);
    }

}
