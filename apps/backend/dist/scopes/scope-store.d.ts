import type { Scope, ScopeUpdate } from './scope-types';
import type { ScopeTemplateInput } from './scope-template';
export interface ListFilters {
    status?: string;
    phase?: string;
}
export declare function list(filters?: ListFilters): Scope[];
export declare function read(scope_id: string): Scope | null;
export declare function create(input: ScopeTemplateInput): Scope;
export declare function update(scope_id: string, updates: ScopeUpdate): Scope | null;
export declare function claim(scope_id: string, agent_id: string): {
    success: boolean;
    scope?: Scope;
    error?: string;
};
export declare function appendNotes(scope_id: string, notes: string): Scope | null;
export declare function complete(scope_id: string, result: string): Scope | null;
export declare function block(scope_id: string, reason: string): Scope | null;
export declare function getStatus(): {
    total: number;
    by_status: Record<string, number>;
    by_phase: Record<string, number>;
    active_scopes: Array<{
        scope_id: string;
        title: string;
        agent_id: string;
        phase: string;
    }>;
    blocked_scopes: Array<{
        scope_id: string;
        title: string;
        phase: string;
    }>;
};
//# sourceMappingURL=scope-store.d.ts.map