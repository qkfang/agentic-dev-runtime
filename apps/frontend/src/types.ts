export interface Scope {
  scope_id: string;
  title: string;
  phase: string;
  status: 'open' | 'active' | 'done' | 'blocked' | 'conflict';
  agent_id?: string;
  created_at: string;
  updated_at: string;
  priority: 'low' | 'normal' | 'high';
  content?: string;
}

export interface ProjectStatus {
  summary: {
    open: number;
    active: number;
    done: number;
    blocked: number;
    conflict: number;
    total: number;
  };
  activeScopes: Scope[];
  blockedScopes: Scope[];
}

export interface BootstrapResult {
  scopes: Scope[];
  message?: string;
}
