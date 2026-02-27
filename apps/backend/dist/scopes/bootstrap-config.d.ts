import type { ScopeTemplateInput } from './scope-template';
export interface PhaseMetadata {
    title: string;
    description: string;
    outputs: string;
}
export declare const BOOTSTRAP_PHASES: ScopeTemplateInput['phase'][];
export declare const PHASE_METADATA: Record<ScopeTemplateInput['phase'], PhaseMetadata>;
/** Truncate text to a maximum length at a word boundary, appending '…' if truncated. */
export declare function truncateAtWordBoundary(text: string, maxLength: number): string;
//# sourceMappingURL=bootstrap-config.d.ts.map