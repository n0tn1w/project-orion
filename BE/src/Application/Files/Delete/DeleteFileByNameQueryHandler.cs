using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Abstractions.Data;
using Application.Abstractions.Messaging;
using Application.Files.Download;
using Domain.Files;
using SharedKernel;

namespace Application.Files.Delete;

internal sealed class DeleteFileByNameQueryHandler(IFileRepository repository) : IQueryHandler<DeleteFileByNameQuery, bool>
{
    public async Task<Result<bool>> Handle(DeleteFileByNameQuery query, CancellationToken cancellationToken)
    {
        bool result = await repository.DeleteByName(query.fileName, cancellationToken);
        return Result<bool>.Success(result);
    }
}
