using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Abstractions.Messaging;
using Application.Files.Download;

namespace Application.Files.Delete;
public sealed record DeleteFileByNameQuery(string fileName) : IQuery<bool>;
