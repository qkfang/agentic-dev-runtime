# Agentic Dev Runtime — Development Plan

## Goal

Build a minimal but functional implementation of the Agentic Dev Runtime concept:
a **Control Plane** that coordinates multiple coding agents working in parallel on a software project,
using plain markdown files as its persistent memory and exposing itself as both a REST API and an MCP server.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CONTROL PLANE AGENT                          │
│                                                                     │
│  Input: requirements.md  (project brief, one per project)          │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    SCOPE REGISTRY (filesystem)                │  │
│  │                                                               │  │
│  │  /workspace/                                                  │  │
│  │    requirements.md          ← project input                  │  │
│  │    scopes/                                                    │  │
│  │      S001-design-auth-api.md                                  │  │
│  │      S002-build-user-schema.md                                │  │
│  │      S003-test-login-flow.md                                  │  │
│  │      ...                                                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Exposed as:                                                        │
│    → REST API  (HTTP)                                               │
│    → MCP Server  (stdio / SSE)                                      │
└─────────────────────────────────────────────────────────────────────┘
                ↑↓ tools / HTTP                ↑↓ tools / HTTP
          [ Coding Agent A ]           [ Coding Agent B ]   ...
```

---

## Component Breakdown

### 1. Scope File Format

Every unit of work in the system is a single markdown file stored in `scopes/`.
The file is the agent's **memory** for that scope — inputs consumed, decisions made, outputs produced.

**Filename convention:** `{SCOPE_ID}-{slug}.md`

**File structure:**

```markdown
---
scope_id: S001
title: Define REST API contract for Authentication Service
phase: design
status: open          # open | active | done | blocked | conflict
agent_id:             # filled when claimed
created_at: 2026-02-27T10:00:00Z
updated_at: 2026-02-27T10:00:00Z
priority: normal      # low | normal | high
---

## Description

Short description of the work to be done.

## Inputs

- requirements.md § "Authentication requirements" (section reference)
- scope: S002 (User model schema — must be Done before this can start)

## Outputs

- docs/api/auth-service.yaml
- docs/adr/001-auth-strategy.md

## Memory / Working Notes

(Agent writes its reasoning, decisions, and intermediate findings here as it works.)

## Result

(Agent writes its final summary and artifact locations here when Done.)
```

---

### 2. Control Plane Agent

The Control Plane is itself an **agent** — it holds a system prompt that defines its coordination role,
reads `requirements.md` to bootstrap the project, and has the following responsibilities:

| Responsibility | Description |
|----------------|-------------|
| **Bootstrap** | Read `requirements.md`, decompose into initial set of scope files, write them to `scopes/` |
| **Coordinate** | Answer queries about what is open, active, done, or blocked |
| **Gate** | Enforce dependency ordering — a scope cannot go `active` if a dependency is not `done` |
| **Conflict detect** | If two agents claim the same scope, raise a `conflict` scope |
| **Triage** | When a test/monitor scope completes with failures, open new fix scopes automatically |
| **Summarize** | Provide a snapshot of project state on request |

The Control Plane agent's system prompt:

```
You are the Control Plane Agent for the Agentic Dev Runtime.
Your memory is the filesystem at /workspace/scopes/*.md.
Your input is /workspace/requirements.md.

On bootstrap: decompose requirements.md into scope files covering
Analyze → Design → Build → Test → Deploy → Monitor phases.

On every interaction:
- Read scope files to assess current project state.
- Enforce dependency rules before allowing a scope to go active.
- Detect and resolve conflicts.
- Open new scopes when failures or gaps are detected.
- Never do the implementation work yourself — only coordinate.
```

---

### 3. REST API

Simple HTTP server exposing CRUD operations over the scope files.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/bootstrap` | Accept `requirements.md` body, trigger Control Plane agent to create initial scopes |
| `GET` | `/scopes` | List all scopes, optional `?status=open&phase=build` filters |
| `GET` | `/scopes/{scope_id}` | Read a single scope file (full markdown) |
| `POST` | `/scopes/{scope_id}/claim` | Atomically claim an open scope (sets status=active, agent_id) |
| `PATCH` | `/scopes/{scope_id}/notes` | Append to the Memory section of a scope file |
| `POST` | `/scopes/{scope_id}/complete` | Mark scope as done, write Result section |
| `POST` | `/scopes/{scope_id}/block` | Mark scope as blocked, provide reason |
| `GET` | `/project/status` | Control Plane agent summarizes overall project state |
| `POST` | `/project/triage` | Control Plane agent reads all scopes and opens any missing/follow-up scopes |

All scope mutations are file writes — no database.

---

### 4. MCP Server

Expose the same operations as MCP tools so that any MCP-compatible coding agent
(e.g. VS Code Copilot, Claude, etc.) can interact with the Control Plane directly
without HTTP boilerplate.

**MCP Tools:**

| Tool Name | Parameters | Description |
|-----------|-----------|-------------|
| `list_scopes` | `status?`, `phase?` | List scope summaries from scope files |
| `read_scope` | `scope_id` | Read full content of a scope file |
| `claim_scope` | `scope_id`, `agent_id` | Claim an open scope |
| `append_notes` | `scope_id`, `notes` | Append working notes to scope memory |
| `complete_scope` | `scope_id`, `result`, `artifacts[]` | Mark scope done, write result |
| `block_scope` | `scope_id`, `reason` | Mark scope blocked |
| `bootstrap_project` | `requirements_md` | Seed the project from a requirements markdown string |
| `project_status` | — | Ask Control Plane agent for a plain-English project summary |
| `triage` | — | Ask Control Plane agent to detect gaps and open missing scopes |

---

## Folder Structure

```
agentic-dev-runtime/
├── README.md
├── AGENTIC_SDLC.md
├── DEV_PLAN.md                    ← this file
│
├── control-plane/                 ← Control Plane server
│   ├── src/
│   │   ├── index.ts               ← entry point (starts API + MCP)
│   │   ├── api/
│   │   │   ├── server.ts          ← Express/Hono HTTP server
│   │   │   └── routes.ts          ← REST route handlers
│   │   ├── mcp/
│   │   │   ├── server.ts          ← MCP server setup
│   │   │   └── tools.ts           ← MCP tool definitions
│   │   ├── agent/
│   │   │   ├── control-plane-agent.ts  ← LLM agent (bootstrap, triage, summarize)
│   │   │   └── prompts.ts         ← system prompt + task prompts
│   │   └── scopes/
│   │       ├── scope-store.ts     ← read/write scope markdown files
│   │       ├── scope-parser.ts    ← parse frontmatter + sections
│   │       └── scope-template.ts  ← generate new scope file content
│   ├── package.json
│   └── tsconfig.json
│
└── workspace/                     ← runtime data (git-tracked for demo, gitignored in prod)
    ├── requirements.md            ← project input (user provides this)
    └── scopes/                    ← scope files created by Control Plane agent
        └── .gitkeep
```

---

## Implementation Phases

### Phase 1 — Scope Store (no LLM)

Build the pure file I/O layer and REST API for scope management.
No LLM or MCP yet — just confirm the data model works.

- [ ] `scope-parser.ts` — parse a scope markdown file (frontmatter + sections)
- [ ] `scope-store.ts` — list, read, create, update scope files on disk
- [ ] `scope-template.ts` — generate a blank scope file from a struct
- [ ] REST API routes — all endpoints above backed by file store
- [ ] Atomic claim — use a file lock or rename trick to prevent double-claims
- [ ] Basic tests — create, claim, complete, list with filters

### Phase 2 — Control Plane Agent

Add the LLM-backed agent that reads `requirements.md` and manages coordination.

- [ ] `control-plane-agent.ts` — wraps an LLM call with scope-store tools
- [ ] Bootstrap tool — reads `requirements.md`, generates initial scope files
- [ ] Triage tool — scans all scope files, opens follow-up scopes for failures/gaps
- [ ] Status summary tool — produces plain-English project status report
- [ ] Dependency gate — enforce `consumes` dependencies before allowing `active`

### Phase 3 — MCP Server

Expose all scope-store operations and Control Plane agent actions as MCP tools.

- [ ] MCP server setup (stdio transport for local agent use)
- [ ] Implement all 9 MCP tools listed above
- [ ] Test with VS Code MCP client / Copilot agent

### Phase 4 — Integration Demo

End-to-end demo: provide a `requirements.md`, watch the Control Plane bootstrap scopes,
have two or more agent sessions claim and complete scopes in parallel.

- [ ] Sample `requirements.md` for a simple todo API project
- [ ] Demo script: two terminal windows running coding agents that claim scopes
- [ ] Record scope files evolving on disk as agents work

---

## Technology Choices

| Concern | Choice | Reason |
|---------|--------|--------|
| Runtime | Node.js + TypeScript | Good MCP SDK support, simple file I/O |
| HTTP server | Hono | Lightweight, works in Node and edge |
| MCP SDK | `@modelcontextprotocol/sdk` | Official SDK |
| LLM client | `openai` SDK (configurable endpoint) | Works with OpenAI, Azure OpenAI, local models |
| Scope persistence | Markdown files on disk | Human-readable, git-trackable, no DB needed |
| Frontmatter parsing | `gray-matter` | Standard YAML frontmatter parser |
| File locking (atomic claim) | `proper-lockfile` | Prevents race conditions on concurrent claims |

---

## Key Design Decisions

**Why markdown files instead of a database?**
Markdown files are human-readable, git-trackable, and trivially inspectable.
Any agent or human can open a scope file and understand exactly what is happening.
The "memory" of the project is always in plain text.

**Why is the Control Plane itself an agent?**
Decomposing requirements into scopes, detecting gaps, and triaging failures are
judgment tasks — not deterministic algorithms. Making the Control Plane an LLM agent
means it can handle ambiguity, generate missing scopes from natural language requirements,
and reason about project state in the same way a tech lead would.

**Why MCP + REST?**
REST is for any HTTP client (scripts, CI, custom tools).
MCP is for coding agents (VS Code Copilot, Claude, etc.) that natively support tool calling —
they can interact with the Control Plane without any custom integration code.
