using System.Text;
using Application.Abstractions.Data;
using Infrastructure.Database.Mssql;
using Infrastructure.Options;
using Infrastructure.Time;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using SharedKernel;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration) =>
        services
            .AddServices()
            .AddDatabase()
            .AddOptions();
            //.AddHealthChecks(configuration);

    private static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddSingleton<IDateTimeProvider, DateTimeProvider>();

        return services;
    }

    private static IServiceCollection AddDatabase(this IServiceCollection services)
    {
        services.AddSingleton<IFileRepository, FileRepository>();

        return services;
    }

    private static IServiceCollection AddOptions(this IServiceCollection services) 
    {
        services.AddOptions<UploadFileOptions>()
            .BindConfiguration(UploadFileOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        return services;
    }

    //private static IServiceCollection AddHealthChecks(this IServiceCollection services, IConfiguration configuration)
    //{
    //    services
    //        .AddHealthChecks();
    //        .AddNpgSql(configuration.GetConnectionString("Database")!);

    //    return services;
    //}
}
