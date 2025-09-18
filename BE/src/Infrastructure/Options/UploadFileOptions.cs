using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Options;
sealed public class UploadFileOptions
{
    public const string SectionName = nameof(UploadFileOptions);

    public string UploadPath { get; set; }
    public string TempPath { get; set; }
}
