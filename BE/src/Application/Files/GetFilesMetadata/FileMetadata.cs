﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Files.Get;
public class FileMetadata
{
    public string FileId { get; set; }
    public string FileName { get; set; }
    public DateTime LastModified { get; set; }
}
