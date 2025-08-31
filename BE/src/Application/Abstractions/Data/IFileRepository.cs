using System;
using Domain.Files;
using Microsoft.AspNetCore.Http;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Application.Abstractions.Data;
public interface IFileRepository
{
    Task<string> Save(Stream fileStream, string fileName, string contentType, long length, CancellationToken ct = default);
    Task<FileEntity> GetByName(string fileName);
}
