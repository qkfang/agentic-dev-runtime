using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace SchedulerApp.Functions;

public class SchedulerFunction
{
    private readonly ILogger<SchedulerFunction> _logger;

    public SchedulerFunction(ILogger<SchedulerFunction> logger)
    {
        _logger = logger;
    }

    // Runs every 2 minutes by default; override via the SchedulerCronExpression app setting.
    [Function(nameof(SchedulerFunction))]
    public void Run([TimerTrigger("%SchedulerCronExpression%")] TimerInfo timerInfo)
    {
        _logger.LogInformation("Scheduler triggered at: {time}", DateTimeOffset.UtcNow);

        if (timerInfo.ScheduleStatus is not null)
        {
            _logger.LogInformation(
                "Next scheduled run: {next}",
                timerInfo.ScheduleStatus.Next);
        }
    }
}
