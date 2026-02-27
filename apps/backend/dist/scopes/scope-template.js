"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderScopeTemplate = renderScopeTemplate;
function renderScopeTemplate(input) {
    const now = new Date().toISOString();
    const { scope_id, title, phase, priority = 'normal', description = '', inputs = '', outputs = '', } = input;
    const frontmatter = [
        '---',
        `scope_id: ${scope_id}`,
        `title: ${title}`,
        `phase: ${phase}`,
        `status: open`,
        `agent_id: `,
        `created_at: ${now}`,
        `updated_at: ${now}`,
        `priority: ${priority}`,
        '---',
    ].join('\n');
    const body = [
        `## Description\n\n${description}`,
        `## Inputs\n\n${inputs}`,
        `## Outputs\n\n${outputs}`,
        `## Memory / Working Notes\n\n`,
        `## Result\n\n`,
    ].join('\n\n');
    return `${frontmatter}\n\n${body}\n`;
}
//# sourceMappingURL=scope-template.js.map