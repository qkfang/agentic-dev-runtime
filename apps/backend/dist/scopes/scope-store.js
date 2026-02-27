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
exports.list = list;
exports.read = read;
exports.create = create;
exports.update = update;
exports.claim = claim;
exports.appendNotes = appendNotes;
exports.complete = complete;
exports.block = block;
exports.getStatus = getStatus;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const scope_parser_1 = require("./scope-parser");
const scope_template_1 = require("./scope-template");
const scope_types_1 = require("./scope-types");
const WORKSPACE_DIR = path.resolve(__dirname, '..', '..', '..', '..', 'workspace', 'scopes');
function ensureWorkspaceDir() {
    if (!fs.existsSync(WORKSPACE_DIR)) {
        fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
    }
}
function list(filters = {}) {
    ensureWorkspaceDir();
    const files = fs.readdirSync(WORKSPACE_DIR).filter(f => f.endsWith('.md'));
    const scopes = [];
    for (const filename of files) {
        try {
            const raw = fs.readFileSync(path.join(WORKSPACE_DIR, filename), 'utf8');
            const scope = (0, scope_parser_1.parseScope)(raw, filename);
            if (filters.status && scope.status !== filters.status)
                continue;
            if (filters.phase && scope.phase !== filters.phase)
                continue;
            scopes.push(scope);
        }
        catch {
            // skip malformed files
        }
    }
    return scopes.sort((a, b) => a.scope_id.localeCompare(b.scope_id));
}
function read(scope_id) {
    ensureWorkspaceDir();
    const files = fs.readdirSync(WORKSPACE_DIR).filter(f => f.endsWith('.md'));
    for (const filename of files) {
        try {
            const raw = fs.readFileSync(path.join(WORKSPACE_DIR, filename), 'utf8');
            const scope = (0, scope_parser_1.parseScope)(raw, filename);
            if (scope.scope_id === scope_id) {
                return scope;
            }
        }
        catch {
            // skip malformed files
        }
    }
    return null;
}
function create(input) {
    ensureWorkspaceDir();
    const filename = (0, scope_types_1.generateFilename)(input.scope_id, input.title);
    const content = (0, scope_template_1.renderScopeTemplate)(input);
    fs.writeFileSync(path.join(WORKSPACE_DIR, filename), content, 'utf8');
    return (0, scope_parser_1.parseScope)(content, filename);
}
function update(scope_id, updates) {
    ensureWorkspaceDir();
    const files = fs.readdirSync(WORKSPACE_DIR).filter(f => f.endsWith('.md'));
    for (const filename of files) {
        const filepath = path.join(WORKSPACE_DIR, filename);
        try {
            const raw = fs.readFileSync(filepath, 'utf8');
            const scope = (0, scope_parser_1.parseScope)(raw, filename);
            if (scope.scope_id !== scope_id)
                continue;
            const updated = {
                ...scope,
                ...updates,
                scope_id,
                updated_at: new Date().toISOString(),
            };
            const serialized = (0, scope_parser_1.serializeScope)(updated);
            fs.writeFileSync(filepath, serialized, 'utf8');
            return updated;
        }
        catch {
            // skip malformed files
        }
    }
    return null;
}
function claim(scope_id, agent_id) {
    ensureWorkspaceDir();
    const files = fs.readdirSync(WORKSPACE_DIR).filter(f => f.endsWith('.md'));
    for (const filename of files) {
        const filepath = path.join(WORKSPACE_DIR, filename);
        try {
            const raw = fs.readFileSync(filepath, 'utf8');
            const scope = (0, scope_parser_1.parseScope)(raw, filename);
            if (scope.scope_id !== scope_id)
                continue;
            if (scope.status !== 'open') {
                return { success: false, error: `Scope is not open (current status: ${scope.status})` };
            }
            const updated = {
                ...scope,
                status: 'active',
                agent_id,
                updated_at: new Date().toISOString(),
            };
            const serialized = (0, scope_parser_1.serializeScope)(updated);
            // Write and re-read to verify the claim was persisted correctly
            fs.writeFileSync(filepath, serialized, 'utf8');
            const verified = (0, scope_parser_1.parseScope)(fs.readFileSync(filepath, 'utf8'), filename);
            if (verified.status !== 'active' || verified.agent_id !== agent_id) {
                return { success: false, error: 'Claim could not be verified after write' };
            }
            return { success: true, scope: verified };
        }
        catch (err) {
            return { success: false, error: String(err) };
        }
    }
    return { success: false, error: `Scope ${scope_id} not found` };
}
function appendNotes(scope_id, notes) {
    const scope = read(scope_id);
    if (!scope)
        return null;
    const timestamp = new Date().toISOString();
    const entry = `\n\n[${timestamp}]\n${notes}`;
    const updatedNotes = (scope.notes || '') + entry;
    return update(scope_id, { notes: updatedNotes });
}
function complete(scope_id, result) {
    return update(scope_id, { status: 'done', result });
}
function block(scope_id, reason) {
    const scope = read(scope_id);
    if (!scope)
        return null;
    const timestamp = new Date().toISOString();
    const entry = `\n\n[${timestamp}] BLOCKED: ${reason}`;
    const updatedNotes = (scope.notes || '') + entry;
    return update(scope_id, { status: 'blocked', notes: updatedNotes });
}
function getStatus() {
    const scopes = list();
    const by_status = {};
    const by_phase = {};
    const active_scopes = [];
    const blocked_scopes = [];
    for (const scope of scopes) {
        by_status[scope.status] = (by_status[scope.status] || 0) + 1;
        by_phase[scope.phase] = (by_phase[scope.phase] || 0) + 1;
        if (scope.status === 'active') {
            active_scopes.push({
                scope_id: scope.scope_id,
                title: scope.title,
                agent_id: scope.agent_id,
                phase: scope.phase,
            });
        }
        if (scope.status === 'blocked') {
            blocked_scopes.push({
                scope_id: scope.scope_id,
                title: scope.title,
                phase: scope.phase,
            });
        }
    }
    return { total: scopes.length, by_status, by_phase, active_scopes, blocked_scopes };
}
//# sourceMappingURL=scope-store.js.map