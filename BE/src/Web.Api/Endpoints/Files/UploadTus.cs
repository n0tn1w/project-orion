using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using tusdotnet;
using tusdotnet.Interfaces;
using tusdotnet.Models;
using tusdotnet.Models.Configuration;
using tusdotnet.Stores;
using Web.Api.Extensions;
using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Infrastructure.Options;


namespace Web.Api.Endpoints.Files;

internal sealed class UploadTus : IEndpoint
{
    private readonly string _tempPath;
    private readonly string _uploadPath;
    public UploadTus(IOptions<UploadFileOptions> options) 
    {
        _uploadPath = options.Value.UploadPath;
        _tempPath = options.Value.TempPath;

        Directory.CreateDirectory(_uploadPath);
        Directory.CreateDirectory(_tempPath);
    }

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        WebApplication web = (WebApplication)app;

        web.Map("/files/tus", branch =>
        {
            branch.UseTus(_ => new DefaultTusConfiguration
            {
                UrlPath = "/files/tus",
                Store = new TusDiskStore(_tempPath),
                MaxAllowedUploadSizeInBytesLong = long.MaxValue,
                Events = new Events
                {
                    OnFileCompleteAsync = async ctx =>
                    {
                        ITusFile file = await ctx.GetFileAsync();
                        Dictionary<string, Metadata> metadata = await file.GetMetadataAsync(ctx.CancellationToken);


                        string originalName = metadata != null && metadata.TryGetValue("filename", out tusdotnet.Models.Metadata mfn)
                            ? mfn.GetString(Encoding.UTF8)
                            : ctx.FileId;

                        string safeName = Path.GetFileName(originalName);
                        string srcPath = Path.Combine(_tempPath, ctx.FileId);
                        string dstPath = Path.Combine(_uploadPath, safeName);

                        if (File.Exists(dstPath))
                        {
                            string name = Path.GetFileNameWithoutExtension(safeName);
                            string ext = Path.GetExtension(safeName);
                            dstPath = Path.Combine(
                                _uploadPath,
                                $"{name}-{DateTime.UtcNow:yyyyMMddHHmmss}{ext}");
                        }

                        File.Move(srcPath, dstPath);

                        await new TusDiskStore(_tempPath).RemoveExpiredFilesAsync(ctx.CancellationToken);
                    }
                }
            });
        });
    }
}
