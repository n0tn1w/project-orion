using System;
using Application.Files.Get;
using Domain.Files;
using Microsoft.AspNetCore.Http;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Application.Abstractions.Data;
public interface IFileRepository
{
    Task<string> SaveAsync(Stream fileStream, string fileName, string contentType, long length, CancellationToken ct = default);
    Task<FileEntity> GetByName(string fileName);
    Task<IEnumerable<FileMetadata>> GetAll(CancellationToken ct = default);
}
