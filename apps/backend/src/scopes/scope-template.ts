import type { Scope, ScopeFrontmatter, ScopeSections } from './scope-types';

export interface ScopeTemplateInput {
  scope_id: string;
  title: string;
  phase: ScopeFrontmatter['phase'];
  priority?: ScopeFrontmatter['priority'];
  description?: string;
  inputs?: string;
  outputs?: string;
}

export function renderScopeTemplate(input: ScopeTemplateInput): string {
  const now = new Date().toISOString();
  const {
    scope_id,
    title,
    phase,
    priority = 'normal',
    description = '',
    inputs = '',
    outputs = '',
  } = input;

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
