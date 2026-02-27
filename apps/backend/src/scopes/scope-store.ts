import fs from 'fs/promises';
import path from 'path';
import { ScopeParser, Scope, ScopeMetadata } from './scope-parser.js';

export class ScopeStore {
  private scopesDir: string;

  constructor(workspaceDir: string) {
    this.scopesDir = path.join(workspaceDir, 'scopes');
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.scopesDir, { recursive: true });
  }

  async list(filters?: { status?: string; phase?: string }): Promise<ScopeMetadata[]> {
    const files = await fs.readdir(this.scopesDir);
    const scopeFiles = files.filter(f => f.endsWith('.md'));

    const scopes: ScopeMetadata[] = [];

    for (const file of scopeFiles) {
      const content = await fs.readFile(path.join(this.scopesDir, file), 'utf-8');
      const scope = ScopeParser.parse(content);

      if (filters?.status && scope.metadata.status !== filters.status) continue;
      if (filters?.phase && scope.metadata.phase !== filters.phase) continue;

      scopes.push(scope.metadata);
    }

    return scopes;
  }

  async read(scopeId: string): Promise<Scope | null> {
    const files = await fs.readdir(this.scopesDir);
    const scopeFile = files.find(f => f.startsWith(scopeId + '-'));

    if (!scopeFile) return null;

    const content = await fs.readFile(path.join(this.scopesDir, scopeFile), 'utf-8');
    return ScopeParser.parse(content);
  }

  async create(scope: Scope): Promise<void> {
    const filename = `${scope.metadata.scope_id}-${this.slugify(scope.metadata.title)}.md`;
    const filepath = path.join(this.scopesDir, filename);
    const content = ScopeParser.serialize(scope);
    await fs.writeFile(filepath, content, 'utf-8');
  }

  async update(scopeId: string, updates: Partial<Scope>): Promise<boolean> {
    const scope = await this.read(scopeId);
    if (!scope) return false;

    const updatedScope: Scope = {
      ...scope,
      ...updates,
      metadata: {
        ...scope.metadata,
        ...updates.metadata,
        updated_at: new Date().toISOString()
      }
    };

    const files = await fs.readdir(this.scopesDir);
    const scopeFile = files.find(f => f.startsWith(scopeId + '-'));
    if (!scopeFile) return false;

    const filepath = path.join(this.scopesDir, scopeFile);
    const content = ScopeParser.serialize(updatedScope);
    await fs.writeFile(filepath, content, 'utf-8');

    return true;
  }

  async claim(scopeId: string, agentId: string): Promise<boolean> {
    const scope = await this.read(scopeId);
    if (!scope) return false;
    if (scope.metadata.status !== 'open') return false;

    return await this.update(scopeId, {
      metadata: {
        ...scope.metadata,
        status: 'active',
        agent_id: agentId
      }
    });
  }

  async appendNotes(scopeId: string, notes: string): Promise<boolean> {
    const scope = await this.read(scopeId);
    if (!scope) return false;

    return await this.update(scopeId, {
      memory: scope.memory + '\n\n' + notes
    });
  }

  async complete(scopeId: string, result: string): Promise<boolean> {
    const scope = await this.read(scopeId);
    if (!scope) return false;

    return await this.update(scopeId, {
      metadata: {
        ...scope.metadata,
        status: 'done'
      },
      result
    });
  }

  async block(scopeId: string, reason: string): Promise<boolean> {
    const scope = await this.read(scopeId);
    if (!scope) return false;

    return await this.update(scopeId, {
      metadata: {
        ...scope.metadata,
        status: 'blocked'
      },
      memory: scope.memory + '\n\n**Blocked:** ' + reason
    });
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }
}
