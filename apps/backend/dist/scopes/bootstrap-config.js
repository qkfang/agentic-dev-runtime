"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONE_DAY_MS = exports.PHASE_ORDER = exports.PHASE_METADATA = exports.BOOTSTRAP_PHASES = void 0;
exports.truncateAtWordBoundary = truncateAtWordBoundary;
exports.BOOTSTRAP_PHASES = [
    'analyze', 'design', 'build', 'test', 'deploy',
];
exports.PHASE_METADATA = {
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
/** Ordered list of SDLC phases used for dependency/triage checks. */
exports.PHASE_ORDER = ['analyze', 'design', 'build', 'test', 'deploy', 'monitor'];
/** One day in milliseconds — used for stale-active-scope detection. */
exports.ONE_DAY_MS = 24 * 60 * 60 * 1000;
function truncateAtWordBoundary(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '…';
}
//# sourceMappingURL=bootstrap-config.js.map