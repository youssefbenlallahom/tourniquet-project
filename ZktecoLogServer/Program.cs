using ZktecoLogServer;

var builder = WebApplication.CreateBuilder(args);

// ✅ Register services
builder.Services.AddSignalR();
builder.Services.AddSingleton<LogBroadcaster>();
builder.Services.AddSingleton<Operations>();

// ✅ Enable CORS for React frontend (localhost:3000)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000") // React app URL
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// ✅ Enable CORS
app.UseCors();

// ✅ Use routing and map SignalR hub
app.UseRouting();
app.MapHub<LogHub>("/logHub");

var ops = app.Services.GetRequiredService<Operations>();
Console.WriteLine("[MAIN] Starting real-time logging...");
Task.Run(() => ops.StartRealTimeLog());


app.Run();
