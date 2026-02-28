namespace ControlPlane.Backend.Models;

public class ScopeMetadata
{
    public string scope_id { get; set; } = string.Empty;
    public string title { get; set; } = string.Empty;
    public string phase { get; set; } = string.Empty;
    public string status { get; set; } = string.Empty;
    public string? agent_id { get; set; }
    public DateTime created_at { get; set; }
    public DateTime updated_at { get; set; }
    public string priority { get; set; } = string.Empty;
}

public class Scope
{
    public ScopeMetadata metadata { get; set; } = new();
    public string description { get; set; } = string.Empty;
    public string inputs { get; set; } = string.Empty;
    public string outputs { get; set; } = string.Empty;
    public string memory { get; set; } = string.Empty;
    public string result { get; set; } = string.Empty;
}

public class ClaimRequest
{
    public string agent_id { get; set; } = string.Empty;
}

public class NotesRequest
{
    public string notes { get; set; } = string.Empty;
}

public class CompleteRequest
{
    public string result { get; set; } = string.Empty;
}

public class BlockRequest
{
    public string reason { get; set; } = string.Empty;
}
