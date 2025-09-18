using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Abstractions.Data;
using Application.Files.Get;
using Domain.Files;
using Infrastructure.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Options;
using SharedKernel;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace Infrastructure.Database.Mssql;
public sealed class FileRepository(IOptions<UploadFileOptions> options) : IFileRepository
{
    private readonly FileExtensionContentTypeProvider _types = new();

    public Task<FileEntity> GetByName(string fileName, CancellationToken ct = default)
    {
        string path = Path.Combine(options.Value.UploadPath, fileName);

        if (!File.Exists(path))
        {
            throw new FileNotFoundException(fileName);
        }

        FileInfo fileInfo = new FileInfo(path);
        string name = fileInfo.Name;
        if (!_types.TryGetContentType(name, out string contentType))
        {
            contentType = "application/octet-stream";
        }

        FileStream stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        FileEntity payload = new FileEntity()
        {
            Stream = stream,
            FileName = name,
            ContentType = contentType,
            LastModified = fileInfo.LastWriteTimeUtc,
            Length = fileInfo.Length,
        };

        return Task.FromResult(payload);
    }

    public Task<bool> DeleteByName(string fileName, CancellationToken ct = default)
    {
        string root = options.Value.UploadPath;
        string safeName = Path.GetFileName(fileName);
        string path = Path.Combine(root, safeName);

        if (!File.Exists(path))
        {
            throw new FileNotFoundException(fileName);
        }

        File.Delete(path);
        return Task.FromResult(true);

    }

    public async Task<string> SaveAsync(Stream fileStream, string fileName, string contentType, long length, CancellationToken ct = default)
    {
        string root = options.Value.UploadPath;
        Directory.CreateDirectory(root);

        string safeName = Path.GetFileName(string.IsNullOrWhiteSpace(fileName) ? "file" : fileName);
        string path = Path.Combine(root, safeName);

        if (File.Exists(path))
        {
            string name = Path.GetFileNameWithoutExtension(safeName);
            string ext = Path.GetExtension(safeName);
            safeName = $"{name}-{DateTime.UtcNow:yyyyMMddHHmmss}{ext}";
            path = Path.Combine(root, safeName);
        }

        const int bufferSize = 81920;
        await using (FileStream output = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None, bufferSize, true))
        {
            await fileStream.CopyToAsync(output, bufferSize, ct).ConfigureAwait(false);
        }

        return safeName;

    }

    public Task<IEnumerable<FileMetadata>> GetAll(CancellationToken ct = default)
    {
        string root = options.Value.UploadPath;

        if (!Directory.Exists(root))
        {
            throw new DirectoryNotFoundException(root);
        }

        List<FileMetadata> list = new List<FileMetadata>();
        foreach (string path in Directory.EnumerateFiles(root))
        {
            FileInfo fi = new FileInfo(path);
            list.Add(new FileMetadata
            {
                FileId = fi.Name,
                FileName = fi.Name,
                LastModified = fi.LastWriteTimeUtc
            });
        }

        return Task.FromResult<IEnumerable<FileMetadata>>(list);
    }
}
