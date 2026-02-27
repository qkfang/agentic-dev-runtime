import { ProjectStatus, Scope, BootstrapResult } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

interface ScopesResponse {
  scopes: Scope[];
  total: number;
}

interface StatusResponse {
  total: number;
  by_status: Record<string, number>;
  by_phase: Record<string, number>;
  active_scopes: Array<{ scope_id: string; title: string; agent_id: string; phase: string }>;
  blocked_scopes: Array<{ scope_id: string; title: string; phase: string }>;
}

export async function getProjectStatus(): Promise<ProjectStatus> {
  const raw = await request<StatusResponse>('/project/status');
  return {
    summary: {
      open: raw.by_status['open'] ?? 0,
      active: raw.by_status['active'] ?? 0,
      done: raw.by_status['done'] ?? 0,
      blocked: raw.by_status['blocked'] ?? 0,
      conflict: raw.by_status['conflict'] ?? 0,
      total: raw.total,
    },
    activeScopes: raw.active_scopes.map(s => ({ ...s, status: 'active' as const, priority: 'normal' as const, created_at: '', updated_at: '' })),
    blockedScopes: raw.blocked_scopes.map(s => ({ ...s, status: 'blocked' as const, priority: 'normal' as const, created_at: '', updated_at: '' })),
  };
}

export async function getScopes(filters?: {
  status?: string;
  phase?: string;
}): Promise<Scope[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.phase) params.set('phase', filters.phase);
  const qs = params.toString();
  const data = await request<ScopesResponse>(`/scopes${qs ? `?${qs}` : ''}`);
  return data.scopes;
}

export async function getScope(scopeId: string): Promise<Scope> {
  return request<Scope>(`/scopes/${scopeId}`);
}

export async function claimScope(
  scopeId: string,
  agentId: string
): Promise<Scope> {
  const data = await request<{ scope: Scope }>(`/scopes/${scopeId}/claim`, {
    method: 'POST',
    body: JSON.stringify({ agent_id: agentId }),
  });
  return data.scope;
}

export async function appendNotes(
  scopeId: string,
  notes: string
): Promise<Scope> {
  const data = await request<{ scope: Scope }>(`/scopes/${scopeId}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });
  return data.scope;
}

export async function completeScope(
  scopeId: string,
  result: string,
  artifacts?: string[]
): Promise<Scope> {
  const data = await request<{ scope: Scope }>(`/scopes/${scopeId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ result, artifacts }),
  });
  return data.scope;
}

export async function blockScope(
  scopeId: string,
  reason: string
): Promise<Scope> {
  const data = await request<{ scope: Scope }>(`/scopes/${scopeId}/block`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
  return data.scope;
}

export async function bootstrapProject(
  requirementsMd: string
): Promise<BootstrapResult> {
  return request<BootstrapResult>('/bootstrap', {
    method: 'POST',
    body: JSON.stringify({ requirements_md: requirementsMd }),
  });
}

export async function triageProject(): Promise<{ message: string }> {
  const data = await request<{ suggestions: string[]; total_suggestions: number }>('/project/triage', { method: 'POST' });
  return { message: data.suggestions.length > 0 ? data.suggestions.join('\n') : 'No issues found — project looks healthy!' };
}
