import type { ScopeTemplateInput } from './scope-template';

export interface PhaseMetadata {
  title: string;
  description: string;
  outputs: string;
}

export const BOOTSTRAP_PHASES: ScopeTemplateInput['phase'][] = [
  'analyze', 'design', 'build', 'test', 'deploy',
];

export const PHASE_METADATA: Record<ScopeTemplateInput['phase'], PhaseMetadata> = {
  analyze: {
    title: 'Analyze Requirements',
    description: 'Review and analyze the provided requirements. Identify key entities, constraints, and success criteria.',
    outputs: '- docs/analysis/requirements-breakdown.md\n- docs/analysis/entities.md',
  },
  design: {
    title: 'Design System Architecture',
    description: 'Design the overall system architecture based on requirements analysis. Define APIs, data models, and component boundaries.',
    outputs: '- docs/design/architecture.md\n- docs/design/api-contract.yaml\n- docs/design/data-model.md',
  },
  build: {
    title: 'Implement Core Features',
    description: 'Implement the core features as defined in the design phase. Write production-ready code with appropriate error handling.',
    outputs: '- src/ (implemented codebase)\n- README.md (setup instructions)',
  },
  test: {
    title: 'Write and Run Tests',
    description: 'Write unit, integration, and end-to-end tests. Achieve target test coverage and fix any failures found.',
    outputs: '- tests/ (test suite)\n- docs/test-report.md',
  },
  deploy: {
    title: 'Deploy and Validate',
    description: 'Deploy the application to the target environment. Validate all endpoints and features work correctly in production.',
    outputs: '- deployment/config/ (deployment configuration)\n- docs/runbook.md',
  },
  monitor: {
    title: 'Monitor and Observe',
    description: 'Set up monitoring, logging, and alerting. Establish baselines and ensure observability is in place.',
    outputs: '- deployment/monitoring/ (dashboards and alerts)\n- docs/observability.md',
  },
};

/** Truncate text to a maximum length at a word boundary, appending '…' if truncated. */
export function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
}
