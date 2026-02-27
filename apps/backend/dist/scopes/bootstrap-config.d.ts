import type { ScopeTemplateInput } from './scope-template';
export interface PhaseMetadata {
    title: string;
    description: string;
    outputs: string;
}
export declare const BOOTSTRAP_PHASES: ScopeTemplateInput['phase'][];
export declare const PHASE_METADATA: Record<ScopeTemplateInput['phase'], PhaseMetadata>;
/** Ordered list of SDLC phases used for dependency/triage checks. */
export declare const PHASE_ORDER: string[];
/** One day in milliseconds — used for stale-active-scope detection. */
export declare const ONE_DAY_MS: number;
export declare function truncateAtWordBoundary(text: string, maxLength: number): string;
//# sourceMappingURL=bootstrap-config.d.ts.map