"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolDefinitions = void 0;
exports.handleTool = handleTool;
const store = __importStar(require("../scopes/scope-store"));
const scope_types_1 = require("../scopes/scope-types");
const bootstrap_config_1 = require("../scopes/bootstrap-config");
function ok(data) {
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}
function err(message) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: message }) }], isError: true };
}
exports.toolDefinitions = [
    {
        name: 'list_scopes',
        description: 'List scope summaries, optionally filtered by status and/or phase',
        inputSchema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['open', 'active', 'done', 'blocked', 'conflict'],
                    description: 'Filter by scope status',
                },
                phase: {
                    type: 'string',
                    enum: ['analyze', 'design', 'build', 'test', 'deploy', 'monitor'],
                    description: 'Filter by project phase',
                },
            },
        },
    },
    {
        name: 'read_scope',
        description: 'Read the full content of a single scope file by scope_id',
        inputSchema: {
            type: 'object',
            properties: {
                scope_id: { type: 'string', description: 'The scope ID (e.g. S001)' },
            },
            required: ['scope_id'],
        },
    },
    {
        name: 'claim_scope',
        description: 'Claim an open scope, setting its status to active',
        inputSchema: {
            type: 'object',
            properties: {
                scope_id: { type: 'string', description: 'The scope ID to claim' },
                agent_id: { type: 'string', description: 'Identifier of the claiming agent' },
            },
            required: ['scope_id', 'agent_id'],
        },
    },
    {
        name: 'append_notes',
        description: 'Append working notes to the Memory / Working Notes section of a scope',
        inputSchema: {
            type: 'object',
            properties: {
                scope_id: { type: 'string', description: 'The scope ID' },
                notes: { type: 'string', description: 'Notes to append' },
            },
            required: ['scope_id', 'notes'],
        },
    },
    {
        name: 'complete_scope',
        description: 'Mark a scope as done and write the result summary',
        inputSchema: {
            type: 'object',
            properties: {
                scope_id: { type: 'string', description: 'The scope ID' },
                result: { type: 'string', description: 'Final result summary' },
                artifacts: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of artifact paths produced',
                },
            },
            required: ['scope_id', 'result'],
        },
    },
    {
        name: 'block_scope',
        description: 'Mark a scope as blocked with a reason',
        inputSchema: {
            type: 'object',
            properties: {
                scope_id: { type: 'string', description: 'The scope ID' },
                reason: { type: 'string', description: 'Reason for blocking' },
            },
            required: ['scope_id', 'reason'],
        },
    },
    {
        name: 'bootstrap_project',
        description: 'Seed the project with initial scope files from a requirements markdown string',
        inputSchema: {
            type: 'object',
            properties: {
                requirements_md: { type: 'string', description: 'Project requirements in markdown format' },
            },
            required: ['requirements_md'],
        },
    },
    {
        name: 'project_status',
        description: 'Get a summary of the overall project state including counts by status and phase',
        inputSchema: { type: 'object', properties: {} },
    },
    {
        name: 'triage',
        description: 'Detect gaps and return suggestions for missing or follow-up scopes',
        inputSchema: { type: 'object', properties: {} },
    },
];
async function handleTool(name, args) {
    try {
        switch (name) {
            case 'list_scopes': {
                const filters = {};
                if (args.status)
                    filters.status = String(args.status);
                if (args.phase)
                    filters.phase = String(args.phase);
                const scopes = store.list(filters);
                return ok({
                    scopes: scopes.map(s => ({
                        scope_id: s.scope_id,
                        title: s.title,
                        phase: s.phase,
                        status: s.status,
                        agent_id: s.agent_id,
                        priority: s.priority,
                        updated_at: s.updated_at,
                    })),
                    total: scopes.length,
                });
            }
            case 'read_scope': {
                const scope = store.read(String(args.scope_id));
                if (!scope)
                    return err(`Scope ${args.scope_id} not found`);
                return ok(scope);
            }
            case 'claim_scope': {
                const result = store.claim(String(args.scope_id), String(args.agent_id));
                if (!result.success)
                    return err(result.error ?? 'Claim failed');
                return ok({ message: 'Scope claimed', scope: result.scope });
            }
            case 'append_notes': {
                const scope = store.appendNotes(String(args.scope_id), String(args.notes));
                if (!scope)
                    return err(`Scope ${args.scope_id} not found`);
                return ok({ message: 'Notes appended', scope });
            }
            case 'complete_scope': {
                const artifacts = Array.isArray(args.artifacts) ? args.artifacts : [];
                const resultText = artifacts.length > 0
                    ? `${args.result}\n\nArtifacts:\n${artifacts.map(a => `- ${a}`).join('\n')}`
                    : String(args.result);
                const scope = store.complete(String(args.scope_id), resultText);
                if (!scope)
                    return err(`Scope ${args.scope_id} not found`);
                return ok({ message: 'Scope completed', scope });
            }
            case 'block_scope': {
                const scope = store.block(String(args.scope_id), String(args.reason));
                if (!scope)
                    return err(`Scope ${args.scope_id} not found`);
                return ok({ message: 'Scope blocked', scope });
            }
            case 'bootstrap_project': {
                const requirements = String(args.requirements_md);
                const existing = store.list();
                const nextIndex = existing.length + 1;
                const created = [];
                for (let i = 0; i < bootstrap_config_1.BOOTSTRAP_PHASES.length; i++) {
                    const phase = bootstrap_config_1.BOOTSTRAP_PHASES[i];
                    const meta = bootstrap_config_1.PHASE_METADATA[phase];
                    const scope_id = (0, scope_types_1.generateScopeId)(nextIndex + i);
                    const scope = store.create({
                        scope_id,
                        title: meta.title,
                        phase,
                        priority: 'normal',
                        description: `${meta.description}\n\nRequirements:\n${(0, bootstrap_config_1.truncateAtWordBoundary)(requirements, 500)}`,
                        inputs: i === 0
                            ? '- requirements.md (provided via bootstrap)'
                            : `- scope: ${(0, scope_types_1.generateScopeId)(nextIndex + i - 1)} (previous phase output)`,
                        outputs: meta.outputs,
                    });
                    created.push({ scope_id: scope.scope_id, title: scope.title, phase: scope.phase });
                }
                return ok({ message: `Created ${created.length} scopes`, scopes: created });
            }
            case 'project_status': {
                return ok(store.getStatus());
            }
            case 'triage': {
                const scopes = store.list();
                const suggestions = [];
                const byPhase = {};
                for (const s of scopes) {
                    if (!byPhase[s.phase])
                        byPhase[s.phase] = [];
                    byPhase[s.phase].push(s);
                }
                const phaseOrder = ['analyze', 'design', 'build', 'test', 'deploy', 'monitor'];
                for (let i = 1; i < phaseOrder.length; i++) {
                    const prevPhase = phaseOrder[i - 1];
                    const currPhase = phaseOrder[i];
                    const prevScopes = byPhase[prevPhase] ?? [];
                    const currScopes = byPhase[currPhase] ?? [];
                    const prevAllDone = prevScopes.length > 0 && prevScopes.every(s => s.status === 'done');
                    if (prevAllDone && currScopes.length === 0) {
                        suggestions.push(`Phase "${prevPhase}" is complete but no scopes exist for "${currPhase}"`);
                    }
                }
                for (const s of scopes.filter(s => s.status === 'blocked')) {
                    suggestions.push(`Scope ${s.scope_id} (${s.title}) is blocked`);
                }
                if (scopes.length === 0) {
                    suggestions.push('No scopes found. Use bootstrap_project to initialize.');
                }
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
                for (const s of scopes.filter(s => s.status === 'active' && s.updated_at < oneDayAgo)) {
                    suggestions.push(`Scope ${s.scope_id} has been active since ${s.updated_at} — may be stale`);
                }
                return ok({ suggestions, total_suggestions: suggestions.length, scopes_reviewed: scopes.length });
            }
            default:
                return err(`Unknown tool: ${name}`);
        }
    }
    catch (e) {
        return err(String(e));
    }
}
//# sourceMappingURL=tools.js.map