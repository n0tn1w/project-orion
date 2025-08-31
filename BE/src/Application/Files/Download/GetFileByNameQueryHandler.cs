using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Abstractions.Data;
using Application.Abstractions.Messaging;
using Domain.Files;
using SharedKernel;

namespace Application.Files.Download;
internal sealed class GetFileByNameQueryHandler(IFileRepository repository) : IQueryHandler<GetFileByNameQuery, FileResponse>
{
    public async Task<Result<FileResponse>> Handle(GetFileByNameQuery query, CancellationToken cancellationToken)
    {
        FileEntity file = await repository.GetByName(query.fileName);
        return Result<FileResponse>.Success(new FileResponse() { 
            FileData = file.FileData,
            FileName = file.FileName,
            ContentType = file.ContentType,
            Length = file.Length,
        });
    }
}
