export interface ScopeFrontmatter {
  scope_id: string;
  title: string;
  phase: 'analyze' | 'design' | 'build' | 'test' | 'deploy' | 'monitor';
  status: 'open' | 'active' | 'done' | 'blocked' | 'conflict';
  agent_id: string;
  created_at: string;
  updated_at: string;
  priority: 'low' | 'normal' | 'high';
}

export interface ScopeSections {
  description: string;
  inputs: string;
  outputs: string;
  notes: string;
  result: string;
}

export interface Scope extends ScopeFrontmatter, ScopeSections {
  filename: string;
}

export type ScopeUpdate = Partial<ScopeFrontmatter> & Partial<ScopeSections>;

export function generateScopeId(index: number): string {
  const num = String(index).padStart(3, '0');
  return `S${num}`;
}

export function generateFilename(scope_id: string, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
    .replace(/-$/, '');
  return `${scope_id}-${slug}.md`;
}
