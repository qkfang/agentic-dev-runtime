using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace SchedulerApp.Functions;

public class SchedulerFunction
{
    private static readonly HttpClient _httpClient = new();

    private readonly ILogger<SchedulerFunction> _logger;
    private readonly IConfiguration _configuration;

    public SchedulerFunction(ILogger<SchedulerFunction> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    // Runs every 2 hours by default; override via the SchedulerCronExpression app setting.
    [Function(nameof(SchedulerFunction))]
    public async Task Run([TimerTrigger("%SchedulerCronExpression%")] TimerInfo timerInfo)
    {
        _logger.LogInformation("Scheduler triggered at: {time}", DateTimeOffset.UtcNow);

        var token = _configuration["GitHubToken"];
        var repo = _configuration["GitHubRepo"];

        if (!string.IsNullOrEmpty(token) && !string.IsNullOrEmpty(repo))
        {
            await TriggerWorkflowAsync(token, repo, "check-progress.yml");
        }
        else
        {
            _logger.LogWarning("GitHubToken or GitHubRepo not configured; skipping workflow trigger.");
        }

        if (timerInfo.ScheduleStatus is not null)
        {
            _logger.LogInformation("Next scheduled run: {next}", timerInfo.ScheduleStatus.Next);
        }
    }

    private async Task TriggerWorkflowAsync(string token, string repo, string workflow)
    {
        var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"https://api.github.com/repos/{repo}/actions/workflows/{workflow}/dispatches");

        request.Headers.Add("Authorization", $"token {token}");
        request.Headers.Add("User-Agent", "SchedulerApp");
        request.Headers.Add("Accept", "application/vnd.github+json");
        request.Content = new StringContent(
            System.Text.Json.JsonSerializer.Serialize(new { @ref = "main" }),
            System.Text.Encoding.UTF8,
            "application/json");

        var response = await _httpClient.SendAsync(request);
        if (response.IsSuccessStatusCode)
        {
            _logger.LogInformation("Triggered workflow {workflow} in {repo}", workflow, repo);
        }
        else
        {
            var error = await response.Content.ReadAsStringAsync();
            _logger.LogError("Failed to trigger workflow {workflow}: {error}", workflow, error);
        }
    }
}
