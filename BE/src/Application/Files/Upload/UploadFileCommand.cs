using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Abstractions.Messaging;
using Microsoft.AspNetCore.Http;

namespace Application.Files.Upload;
public sealed record UploadFileCommand(
    Stream fileStream,
    string fileName,
    string contentType,
    long size
    ) : ICommand<string>;
