using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using SharedKernel;

namespace Domain.Files;
public sealed class FileEntity : Entity
{
    public byte[] FileData { get; set; }
    public string FileName { get; set; }
    public string ContentType { get; set; }
    public long Length { get; set; }
    public DateTime LastModified { get; set; }
}
