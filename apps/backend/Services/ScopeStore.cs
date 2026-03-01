using ControlPlane.Backend.Models;

namespace ControlPlane.Backend.Services;

public class ScopeStore
{
    private readonly string _scopesDir;

    public ScopeStore(string workspaceDir)
    {
        _scopesDir = Path.Combine(workspaceDir, "scopes");
    }

    public async Task InitializeAsync()
    {
        if (!Directory.Exists(_scopesDir))
        {
            Directory.CreateDirectory(_scopesDir);
        }
        await Task.CompletedTask;
    }

    public async Task<List<ScopeMetadata>> ListAsync(string? status = null, string? phase = null)
    {
        var scopes = new List<ScopeMetadata>();
        var files = Directory.GetFiles(_scopesDir, "*.md");

        foreach (var file in files)
        {
            var content = await File.ReadAllTextAsync(file);
            var scope = ScopeParser.Parse(content);

            if (!string.IsNullOrEmpty(status) && scope.metadata.status != status) continue;
            if (!string.IsNullOrEmpty(phase) && scope.metadata.phase != phase) continue;

            scopes.Add(scope.metadata);
        }

        return scopes;
    }

    public async Task<Scope?> ReadAsync(string scopeId)
    {
        var files = Directory.GetFiles(_scopesDir, "*.md");
        var scopeFile = files.FirstOrDefault(f => Path.GetFileName(f).StartsWith(scopeId + "-"));

        if (scopeFile == null) return null;

        var content = await File.ReadAllTextAsync(scopeFile);
        return ScopeParser.Parse(content);
    }

    public async Task CreateAsync(Scope scope)
    {
        var filename = $"{scope.metadata.scope_id}-{Slugify(scope.metadata.title)}.md";
        var filepath = Path.Combine(_scopesDir, filename);
        var content = ScopeParser.Serialize(scope);
        await File.WriteAllTextAsync(filepath, content);
    }

    public async Task<bool> UpdateAsync(string scopeId, Action<Scope> updateAction)
    {
        var scope = await ReadAsync(scopeId);
        if (scope == null) return false;

        updateAction(scope);
        scope.metadata.updated_at = DateTime.UtcNow;

        var files = Directory.GetFiles(_scopesDir, "*.md");
        var scopeFile = files.FirstOrDefault(f => Path.GetFileName(f).StartsWith(scopeId + "-"));

        if (scopeFile == null) return false;

        var content = ScopeParser.Serialize(scope);
        await File.WriteAllTextAsync(scopeFile, content);

        return true;
    }

    public async Task<bool> ClaimAsync(string scopeId, string agentId)
    {
        var scope = await ReadAsync(scopeId);
        if (scope == null || scope.metadata.status != "open") return false;

        return await UpdateAsync(scopeId, s =>
        {
            s.metadata.status = "active";
            s.metadata.agent_id = agentId;
        });
    }

    public async Task<bool> AppendNotesAsync(string scopeId, string notes)
    {
        return await UpdateAsync(scopeId, s =>
        {
            s.memory += "\n\n" + notes;
        });
    }

    public async Task<bool> CompleteAsync(string scopeId, string result)
    {
        return await UpdateAsync(scopeId, s =>
        {
            s.metadata.status = "done";
            s.result = result;
        });
    }

    public async Task<bool> BlockAsync(string scopeId, string reason)
    {
        return await UpdateAsync(scopeId, s =>
        {
            s.metadata.status = "blocked";
            s.memory += "\n\n**Blocked:** " + reason;
        });
    }

    public async Task BootstrapAsync(string requirementsMd)
    {
        var workspaceDir = Path.GetDirectoryName(_scopesDir)
            ?? throw new InvalidOperationException("Cannot resolve workspace directory from scopes path.");
        var requirementsFile = Path.Combine(workspaceDir, "requirements.md");
        await File.WriteAllTextAsync(requirementsFile, requirementsMd);
    }

    public async Task<object> GetStatusAsync()
    {
        var scopes = await ListAsync();
        return new
        {
            total = scopes.Count,
            done = scopes.Count(s => s.status == "done"),
            active = scopes.Count(s => s.status == "active"),
            open = scopes.Count(s => s.status == "open"),
            blocked = scopes.Count(s => s.status == "blocked"),
            scopes
        };
    }

    private static string Slugify(string text)
    {
        var slug = text.ToLower();
        slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9]+", "-");
        slug = slug.Trim('-');
        return slug.Length > 50 ? slug.Substring(0, 50) : slug;
    }
}
