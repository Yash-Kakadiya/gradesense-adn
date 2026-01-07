using FluentValidation;
using FluentValidation.AspNetCore;
using GradeSense.API.Common.Converters;
using GradeSense.API.Data;
using GradeSense.API.Helpers;
using GradeSense.API.Interfaces.Repositories;
using GradeSense.API.Interfaces.Services;
using GradeSense.API.Models;
using GradeSense.API.Repositories;
using GradeSense.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ============================================================================
// 1. CONFIGURATION
// ============================================================================


// Load JWT Settings from appsettings.json
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
    ?? throw new InvalidOperationException("JwtSettings not found in configuration");

// Validate JWT Settings
if (string.IsNullOrEmpty(jwtSettings.SecretKey) || jwtSettings.SecretKey.Length < 32)
{
    throw new InvalidOperationException("JWT SecretKey must be at least 32 characters long");
}

// Register JWT Settings as Singleton
builder.Services.AddSingleton(jwtSettings);

// Register JWT Token Generator
builder.Services.AddSingleton<JwtTokenGenerator>();

// ============================================================================
// 2. DATABASE
// ============================================================================

builder.Services.AddDbContext<GradeSenseDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure()
    ));

// ============================================================================
// 3. AUTHENTICATION & AUTHORIZATION
// ============================================================================

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.SaveToken = true;
        options.RequireHttpsMetadata = true; // Set to true in production
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero, // No tolerance for expired tokens
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.SecretKey)
            )
        };

        // Custom event handlers
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                {
                    context.Response.Headers.Add("Token-Expired", "true");
                }
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";

                var result = System.Text.Json.JsonSerializer.Serialize(new
                {
                    success = false,
                    message = "You are not authorized to access this resource",
                    data = (object?)null,
                    errors = (object?)null
                });

                return context.Response.WriteAsync(result);
            },
            OnForbidden = context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";

                var result = System.Text.Json.JsonSerializer.Serialize(new
                {
                    success = false,
                    message = "You do not have permission to access this resource",
                    data = (object?)null,
                    errors = (object?)null
                });

                return context.Response.WriteAsync(result);
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    // Define policies for role-based access
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("FacultyOnly", policy => policy.RequireRole("Faculty", "Admin"));
    options.AddPolicy("StudentOnly", policy => policy.RequireRole("Student"));
    options.AddPolicy("FacultyOrAdmin", policy => policy.RequireRole("Faculty", "Admin"));
});

// ============================================================================
// 4. DEPENDENCY INJECTION
// ============================================================================

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IFacultyRepository, FacultyRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<IBatchRepository, BatchRepository>();
builder.Services.AddScoped<ISubjectRepository, SubjectRepository>();
builder.Services.AddScoped<ISubjectUnitRepository, SubjectUnitRepository>();
builder.Services.AddScoped<ICourseOfferingRepository, CourseOfferingRepository>();
builder.Services.AddScoped<ICourseEnrollmentRepository, CourseEnrollmentRepository>();
builder.Services.AddScoped<IEvaluationSchemeRepository, EvaluationSchemeRepository>();
builder.Services.AddScoped<IAssessmentItemRepository, AssessmentItemRepository>();
builder.Services.AddScoped<IStudentMarkRepository, StudentMarkRepository>();
builder.Services.AddScoped<IFacultyAssignmentRepository, FacultyAssignmentRepository>();
builder.Services.AddScoped<IAttendanceRecordRepository, AttendanceRecordRepository>();
builder.Services.AddScoped<IUploadHistoryRepository, UploadHistoryRepository>();
builder.Services.AddScoped<IAuditLogRepository, AuditLogRepository>();
builder.Services.AddScoped<IPredictionRepository, PredictionRepository>();

// Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IFacultyService, FacultyService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IBatchService, BatchService>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<ISubjectUnitService, SubjectUnitService>();
builder.Services.AddScoped<ICourseOfferingService, CourseOfferingService>();
builder.Services.AddScoped<ICourseEnrollmentService, CourseEnrollmentService>();
builder.Services.AddScoped<IEvaluationSchemeService, EvaluationSchemeService>();
builder.Services.AddScoped<IAssessmentItemService, AssessmentItemService>();
builder.Services.AddScoped<IStudentMarkService, StudentMarkService>();
builder.Services.AddScoped<IFacultyAssignmentService, FacultyAssignmentService>();
builder.Services.AddScoped<IAttendanceRecordService, AttendanceRecordService>();
builder.Services.AddScoped<IUploadHistoryService, UploadHistoryService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<IPredictionService, PredictionService>();



// ============================================================================
// 5. CONTROLLERS & JSON OPTIONS
// ============================================================================

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition =
            System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Keep PascalCase

        options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter()); // Register DateOnly converter
    });

// ============================================================================
// 6. FLUENT VALIDATION
// ============================================================================

builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
// ============================================================================
// 7. SWAGGER / OPENAPI
// ============================================================================

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "GradeSense API",
        Version = "v1",
        Description = "Student Performance Tracking System with JWT Authentication",
        Contact = new OpenApiContact
        {
            Name = "GradeSense Team",
            Email = "support@gradesense.edu"
        }
    });

    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = @"JWT Authorization header using the Bearer scheme.
                      Enter 'Bearer' [space] and then your token in the text input below.
                      Example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Enable XML comments (if you have them)
    // var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    // var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    // options.IncludeXmlComments(xmlPath);
});

// ============================================================================
// 8. CORS
// ============================================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });

    // Production CORS policy (more restrictive)
    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins(
                "https://gradesense.com",
                "https://www.gradesense.com",
                "https://app.gradesense.com"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});


// ============================================================================
// 9. LOGGING
// ============================================================================

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// ============================================================================
// BUILD APPLICATION
// ============================================================================

var app = builder.Build();

// ============================================================================
// 10. MIDDLEWARE PIPELINE (ORDER MATTERS!)
// ============================================================================

// Development-specific middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "GradeSense API V1");
        options.RoutePrefix = "swagger"; // Access at /swagger
    });

    app.UseDeveloperExceptionPage();
    app.UseCors("AllowAll");
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
    app.UseCors("Production");
}


// Security headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

app.UseHttpsRedirection();

// CRITICAL: Authentication must come before Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ============================================================================
// 11. ERROR HANDLING ENDPOINT
// ============================================================================

app.MapGet("/error", () => Results.Problem("An error occurred."))
    .ExcludeFromDescription();

// ============================================================================
// 12. STARTUP INFORMATION
// ============================================================================

var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("GradeSense API Starting...");
logger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);
logger.LogInformation("JWT Issuer: {Issuer}", jwtSettings.Issuer);
logger.LogInformation("JWT Expiry: {Expiry} minutes", jwtSettings.ExpiryMinutes);

// ============================================================================
// RUN APPLICATION
// ============================================================================

app.Run();