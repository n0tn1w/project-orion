using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Abstractions.Messaging;
using Microsoft.AspNetCore.Http;

namespace Application.Files.Download;
public sealed record GetFileByNameQuery(string fileName) : IQuery<FileResponse>;
