using Microsoft.AspNetCore.Mvc;
using ControlPlane.Backend.Models;
using ControlPlane.Backend.Services;

namespace ControlPlane.Backend.Controllers;

[ApiController]
[Route("[controller]")]
public class ScopesController : ControllerBase
{
    private readonly ScopeStore _scopeStore;

    public ScopesController(ScopeStore scopeStore)
    {
        _scopeStore = scopeStore;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? status, [FromQuery] string? phase)
    {
        var scopes = await _scopeStore.ListAsync(status, phase);
        return Ok(new { scopes });
    }

    [HttpGet("{scopeId}")]
    public async Task<IActionResult> Get(string scopeId)
    {
        var scope = await _scopeStore.ReadAsync(scopeId);
        if (scope == null)
        {
            return NotFound(new { error = "Scope not found" });
        }
        return Ok(new { scope });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Scope scope)
    {
        await _scopeStore.CreateAsync(scope);
        return Ok(new { success = true });
    }

    [HttpPost("{scopeId}/claim")]
    public async Task<IActionResult> Claim(string scopeId, [FromBody] ClaimRequest request)
    {
        if (string.IsNullOrEmpty(request.agent_id))
        {
            return BadRequest(new { error = "agent_id required" });
        }

        var success = await _scopeStore.ClaimAsync(scopeId, request.agent_id);
        if (!success)
        {
            return BadRequest(new { error = "Cannot claim scope" });
        }

        return Ok(new { success = true });
    }

    [HttpPatch("{scopeId}/notes")]
    public async Task<IActionResult> AppendNotes(string scopeId, [FromBody] NotesRequest request)
    {
        if (string.IsNullOrEmpty(request.notes))
        {
            return BadRequest(new { error = "notes required" });
        }

        var success = await _scopeStore.AppendNotesAsync(scopeId, request.notes);
        if (!success)
        {
            return NotFound(new { error = "Cannot append notes" });
        }

        return Ok(new { success = true });
    }

    [HttpPost("{scopeId}/complete")]
    public async Task<IActionResult> Complete(string scopeId, [FromBody] CompleteRequest request)
    {
        if (string.IsNullOrEmpty(request.result))
        {
            return BadRequest(new { error = "result required" });
        }

        var success = await _scopeStore.CompleteAsync(scopeId, request.result);
        if (!success)
        {
            return NotFound(new { error = "Cannot complete scope" });
        }

        return Ok(new { success = true });
    }

    [HttpPost("{scopeId}/block")]
    public async Task<IActionResult> Block(string scopeId, [FromBody] BlockRequest request)
    {
        if (string.IsNullOrEmpty(request.reason))
        {
            return BadRequest(new { error = "reason required" });
        }

        var success = await _scopeStore.BlockAsync(scopeId, request.reason);
        if (!success)
        {
            return NotFound(new { error = "Cannot block scope" });
        }

        return Ok(new { success = true });
    }
}

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "ok" });
    }
}
