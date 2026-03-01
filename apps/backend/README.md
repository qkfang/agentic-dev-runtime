# Control Plane Backend

.NET 8 Web API for the Agentic Dev Runtime Control Plane.

## Setup

```bash
dotnet restore
```

## Development

```bash
dotnet run
```

Runs on port 3001 by default.

## Build

```bash
dotnet build
```

## Publish

```bash
dotnet publish -c Release -o out
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `WORKSPACE_DIR` - Workspace directory path (default: ../../workspace)
