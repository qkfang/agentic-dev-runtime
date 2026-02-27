import * as fs from 'fs';
import * as path from 'path';
import { parseScope, serializeScope } from './scope-parser';
import { renderScopeTemplate } from './scope-template';
import { generateFilename } from './scope-types';
import type { Scope, ScopeUpdate, ScopeFrontmatter } from './scope-types';
import type { ScopeTemplateInput } from './scope-template';

const WORKSPACE_DIR = path.resolve(__dirname, '..', '..', '..', '..', 'workspace', 'scopes');

function ensureWorkspaceDir(): void {
  if (!fs.existsSync(WORKSPACE_DIR)) {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
  }
}

export interface ListFilters {
  status?: string;
  phase?: string;
}

export function list(filters: ListFilters = {}): Scope[] {
  ensureWorkspaceDir();
  const files = fs.readdirSync(WORKSPACE_DIR).filter(f => f.endsWith('.md'));
  const scopes: Scope[] = [];

  for (const filename of files) {
    try {
      const raw = fs.readFileSync(path.join(WORKSPACE_DIR, filename), 'utf8');
      const scope = parseScope(raw, filename);
      if (filters.status && scope.status !== filters.status) continue;
      if (filters.phase && scope.phase !== filters.phase) continue;
      scopes.push(scope);
    } catch {
      // skip malformed files
    }
  }

  return scopes.sort((a, b) => a.scope_id.localeCompare(b.scope_id));
}

export function read(scope_id: string): Scope | null {
  ensureWorkspaceDir();
  const files = fs.readdirSync(WORKSPACE_DIR).filter(f => f.endsWith('.md'));

  for (const filename of files) {
    try {
      const raw = fs.readFileSync(path.join(WORKSPACE_DIR, filename), 'utf8');
      const scope = parseScope(raw, filename);
      if (scope.scope_id === scope_id) {
        return scope;
      }
    } catch {
      // skip malformed files
    }
  }
  return null;
}

export function create(input: ScopeTemplateInput): Scope {
  ensureWorkspaceDir();
  const filename = generateFilename(input.scope_id, input.title);
  const content = renderScopeTemplate(input);
  fs.writeFileSync(path.join(WORKSPACE_DIR, filename), content, 'utf8');
  return parseScope(content, filename);
}

export function update(scope_id: string, updates: ScopeUpdate): Scope | null {
  ensureWorkspaceDir();
  const files = fs.readdirSync(WORKSPACE_DIR).filter(f => f.endsWith('.md'));

  for (const filename of files) {
    const filepath = path.join(WORKSPACE_DIR, filename);
    try {
      const raw = fs.readFileSync(filepath, 'utf8');
      const scope = parseScope(raw, filename);
      if (scope.scope_id !== scope_id) continue;

      const updated: Scope = {
        ...scope,
        ...updates,
        scope_id,
        updated_at: new Date().toISOString(),
      };

      const serialized = serializeScope(updated);
      fs.writeFileSync(filepath, serialized, 'utf8');
      return updated;
    } catch {
      // skip malformed files
    }
  }
  return null;
}

export function claim(scope_id: string, agent_id: string): { success: boolean; scope?: Scope; error?: string } {
  ensureWorkspaceDir();
  const files = fs.readdirSync(WORKSPACE_DIR).filter(f => f.endsWith('.md'));

  for (const filename of files) {
    const filepath = path.join(WORKSPACE_DIR, filename);
    try {
      const raw = fs.readFileSync(filepath, 'utf8');
      const scope = parseScope(raw, filename);
      if (scope.scope_id !== scope_id) continue;

      if (scope.status !== 'open') {
        return { success: false, error: `Scope is not open (current status: ${scope.status})` };
      }

      const updated: Scope = {
        ...scope,
        status: 'active',
        agent_id,
        updated_at: new Date().toISOString(),
      };

      const serialized = serializeScope(updated);
      // Write and re-read to verify the claim was persisted correctly
      fs.writeFileSync(filepath, serialized, 'utf8');
      const verified = parseScope(fs.readFileSync(filepath, 'utf8'), filename);

      if (verified.status !== 'active' || verified.agent_id !== agent_id) {
        return { success: false, error: 'Claim could not be verified after write' };
      }

      return { success: true, scope: verified };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }
  return { success: false, error: `Scope ${scope_id} not found` };
}

export function appendNotes(scope_id: string, notes: string): Scope | null {
  const scope = read(scope_id);
  if (!scope) return null;

  const timestamp = new Date().toISOString();
  const entry = `\n\n[${timestamp}]\n${notes}`;
  const updatedNotes = (scope.notes || '') + entry;

  return update(scope_id, { notes: updatedNotes });
}

export function complete(scope_id: string, result: string): Scope | null {
  return update(scope_id, { status: 'done', result });
}

export function block(scope_id: string, reason: string): Scope | null {
  const scope = read(scope_id);
  if (!scope) return null;

  const timestamp = new Date().toISOString();
  const entry = `\n\n[${timestamp}] BLOCKED: ${reason}`;
  const updatedNotes = (scope.notes || '') + entry;

  return update(scope_id, { status: 'blocked', notes: updatedNotes });
}

export function getStatus(): {
  total: number;
  by_status: Record<string, number>;
  by_phase: Record<string, number>;
  active_scopes: Array<{ scope_id: string; title: string; agent_id: string; phase: string }>;
  blocked_scopes: Array<{ scope_id: string; title: string; phase: string }>;
} {
  const scopes = list();

  const by_status: Record<string, number> = {};
  const by_phase: Record<string, number> = {};
  const active_scopes: Array<{ scope_id: string; title: string; agent_id: string; phase: string }> = [];
  const blocked_scopes: Array<{ scope_id: string; title: string; phase: string }> = [];

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
