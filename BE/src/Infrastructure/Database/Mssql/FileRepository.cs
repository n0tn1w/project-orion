using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Abstractions.Data;
using Application.Files.Get;
using Domain.Files;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Formatters;
using SharedKernel;

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

    public async Task<string> SaveAsync(Stream fileStream, string fileName, string contentType, long length, CancellationToken ct = default)
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
            Length = length,
            LastModified = DateTime.UtcNow,
        })
            )
        {
            throw new InvalidOperationException("Try add failed");
        }

        return fileId;
    }

    public Task<IEnumerable<FileMetadata>> GetAll(CancellationToken ct = default)
    {
        List<FileMetadata> result = new List<FileMetadata>();
        foreach (KeyValuePair<string, FileEntity> kvp in _inMemoryDb)
        {
            string key = kvp.Key;
            FileEntity value = kvp.Value;

            result.Add(new FileMetadata()
            {
                FileId = key,
                FileName = value.FileName,
                LastModified = value.LastModified
            });
        }

        return Task.FromResult<IEnumerable<FileMetadata>>(result);
    }
}
