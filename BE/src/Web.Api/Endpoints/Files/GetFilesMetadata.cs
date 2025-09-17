
using Application.Abstractions.Messaging;
using Application.Files.Download;
using Application.Files.Get;
using SharedKernel;
using Web.Api.Extensions;

namespace Web.Api.Endpoints.Files;

internal sealed class GetFilesMetadata : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("files/get-metadata", async (
            IQueryHandler<GetFilesMetadataQuery, IEnumerable<FileMetadata>> handler,
            CancellationToken cancellationToken) =>
        {
            GetFilesMetadataQuery query = new();
            Result<IEnumerable<FileMetadata>> handlerResult = await handler.Handle(query, cancellationToken);
            if (!handlerResult.IsSuccess || handlerResult.Value is null)
            {
                return Results.NotFound();
            }


            return Results.Ok(handlerResult.Value);
        })
        .WithTags(Tags.Files);
    }
}
