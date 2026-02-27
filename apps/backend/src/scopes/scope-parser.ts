import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface ScopeMetadata {
  scope_id: string;
  title: string;
  phase: 'analyze' | 'design' | 'build' | 'test' | 'deploy' | 'monitor' | 'iterate';
  status: 'open' | 'active' | 'done' | 'blocked' | 'conflict';
  agent_id?: string;
  created_at: string;
  updated_at: string;
  priority: 'low' | 'normal' | 'high';
}

export interface Scope {
  metadata: ScopeMetadata;
  description: string;
  inputs: string;
  outputs: string;
  memory: string;
  result: string;
}

export class ScopeParser {
  static parse(content: string): Scope {
    const { data, content: body } = matter(content);

    const sections = this.extractSections(body);

    return {
      metadata: data as ScopeMetadata,
      description: sections.description || '',
      inputs: sections.inputs || '',
      outputs: sections.outputs || '',
      memory: sections.memory || '',
      result: sections.result || ''
    };
  }

  static serialize(scope: Scope): string {
    const frontmatter = matter.stringify('', scope.metadata);
    const body = `
## Description

${scope.description}

## Inputs

${scope.inputs}

## Outputs

${scope.outputs}

## Memory / Working Notes

${scope.memory}

## Result

${scope.result}
`;
    return frontmatter.trim() + '\n' + body.trim() + '\n';
  }

  private static extractSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const sectionRegex = /^## (.+)$/gm;

    const matches = [...content.matchAll(sectionRegex)];

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const sectionName = match[1].toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');
      const startIndex = match.index! + match[0].length;
      const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;
      sections[sectionName] = content.substring(startIndex, endIndex).trim();
    }

    return sections;
  }
}
