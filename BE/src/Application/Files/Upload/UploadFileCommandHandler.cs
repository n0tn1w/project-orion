using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using Application.Abstractions.Data;
using Application.Abstractions.Messaging;
using SharedKernel;

namespace Application.Files.Upload;
internal sealed class UploadFileCommandHandler(IFileRepository repostiory) : ICommandHandler<UploadFileCommand, string>
{
    public async Task<Result<string>> Handle(UploadFileCommand command, CancellationToken cancellationToken)
    {
        string id = await repostiory.Save(
            fileStream: command.fileStream,
            fileName: command.fileName,
            contentType: command.contentType ?? "application/octet-stream",
            length: command.size,
            ct: cancellationToken);

        return Result.Success(id);
    }
}
