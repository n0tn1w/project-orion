using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Abstractions.Data;
using Domain.Files;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Formatters;

namespace Infrastructure.Database.Mssql;
public sealed class FileRepository : IFileRepository
{
    private readonly ConcurrentDictionary<string, FileEntity> _inMemoryDb = new();

    public Task<FileEntity> GetByName(string fileName)
    {
        _inMemoryDb.TryGetValue(fileName, out FileEntity entity);
        //TODO if entity is null
        return Task.FromResult(entity!);
    }

    public async Task<string> Save(Stream fileStream, string fileName, string contentType, long length, CancellationToken ct = default)
    {
        string fileId = Guid.NewGuid().ToString("N").Substring(0, 4);

        MemoryStream ms = new MemoryStream((int)fileStream.Length);
        await fileStream.CopyToAsync(ms, 81920, ct).ConfigureAwait(false);
        byte[] bytes = ms.ToArray();

        if (!_inMemoryDb.TryAdd(fileId, new FileEntity()
        {
            FileData = bytes,
            FileName = fileName,
            ContentType = contentType,
            Length = length
        })
            )
        {
            throw new InvalidOperationException("Try add failed");
        }

        return fileId;
    }
}
