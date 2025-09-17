using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Abstractions.Data;
using Application.Abstractions.Messaging;
using SharedKernel;

namespace Application.Files.Get;
internal sealed class GetFilesMetadataQueryHandler(IFileRepository repository) : IQueryHandler<GetFilesMetadataQuery, IEnumerable<FileMetadata>>
{
    public async Task<Result<IEnumerable<FileMetadata>>> Handle(GetFilesMetadataQuery query, CancellationToken cancellationToken)
    {
        return Result.Success(await repository.GetAll(cancellationToken));
    }
}
