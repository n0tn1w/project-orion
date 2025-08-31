using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Application.Files.Download;
public sealed class FileResponse
{
    public byte[] FileData { get; set; }
    public string FileName { get; set; }
    public string ContentType { get; set; }
    public long Length { get; set; }
}
