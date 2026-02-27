import type { ScopeFrontmatter } from './scope-types';
export interface ScopeTemplateInput {
    scope_id: string;
    title: string;
    phase: ScopeFrontmatter['phase'];
    priority?: ScopeFrontmatter['priority'];
    description?: string;
    inputs?: string;
    outputs?: string;
}
export declare function renderScopeTemplate(input: ScopeTemplateInput): string;
//# sourceMappingURL=scope-template.d.ts.map