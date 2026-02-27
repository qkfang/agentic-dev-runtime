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
export declare function generateScopeId(index: number): string;
export declare function generateFilename(scope_id: string, title: string): string;
//# sourceMappingURL=scope-types.d.ts.map