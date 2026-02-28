using ControlPlane.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure ScopeStore
var workspaceDir = Environment.GetEnvironmentVariable("WORKSPACE_DIR")
    ?? Path.Combine(Directory.GetCurrentDirectory(), "../../workspace");

builder.Services.AddSingleton(new ScopeStore(workspaceDir));

var app = builder.Build();

// Initialize ScopeStore
var scopeStore = app.Services.GetRequiredService<ScopeStore>();
await scopeStore.InitializeAsync();

// Configure the HTTP request pipeline.
app.UseCors();

app.MapControllers();

var port = Environment.GetEnvironmentVariable("PORT") ?? "3001";
Console.WriteLine($"Control Plane API starting on port {port}");
Console.WriteLine($"Workspace: {workspaceDir}");

app.Run($"http://0.0.0.0:{port}");
