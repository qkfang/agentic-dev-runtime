import { ProjectStatus, Scope, BootstrapResult } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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

export async function getProjectStatus(): Promise<ProjectStatus> {
  return request<ProjectStatus>('/project/status');
}

export async function getScopes(filters?: {
  status?: string;
  phase?: string;
}): Promise<Scope[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.phase) params.set('phase', filters.phase);
  const qs = params.toString();
  return request<Scope[]>(`/scopes${qs ? `?${qs}` : ''}`);
}

export async function getScope(scopeId: string): Promise<Scope> {
  return request<Scope>(`/scopes/${scopeId}`);
}

export async function claimScope(
  scopeId: string,
  agentId: string
): Promise<Scope> {
  return request<Scope>(`/scopes/${scopeId}/claim`, {
    method: 'POST',
    body: JSON.stringify({ agent_id: agentId }),
  });
}

export async function appendNotes(
  scopeId: string,
  notes: string
): Promise<Scope> {
  return request<Scope>(`/scopes/${scopeId}/notes`, {
    method: 'PATCH',
    body: JSON.stringify({ notes }),
  });
}

export async function completeScope(
  scopeId: string,
  result: string,
  artifacts?: string[]
): Promise<Scope> {
  return request<Scope>(`/scopes/${scopeId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ result, artifacts }),
  });
}

export async function blockScope(
  scopeId: string,
  reason: string
): Promise<Scope> {
  return request<Scope>(`/scopes/${scopeId}/block`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
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
  return request<{ message: string }>('/project/triage', { method: 'POST' });
}
