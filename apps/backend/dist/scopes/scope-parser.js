"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseScope = parseScope;
exports.serializeScope = serializeScope;
const gray_matter_1 = __importDefault(require("gray-matter"));
const SECTION_HEADERS = {
    description: /^##\s+Description\s*$/m,
    inputs: /^##\s+Inputs\s*$/m,
    outputs: /^##\s+Outputs\s*$/m,
    notes: /^##\s+Memory\s*\/\s*Working\s+Notes\s*$/m,
    result: /^##\s+Result\s*$/m,
};
const SECTION_ORDER = [
    'description',
    'inputs',
    'outputs',
    'notes',
    'result',
];
function parseScope(raw, filename) {
    const parsed = (0, gray_matter_1.default)(raw);
    const fm = parsed.data;
    const body = parsed.content;
    const sections = extractSections(body);
    return {
        filename,
        scope_id: fm.scope_id ?? '',
        title: fm.title ?? '',
        phase: fm.phase ?? 'build',
        status: fm.status ?? 'open',
        agent_id: fm.agent_id ?? '',
        created_at: fm.created_at ?? new Date().toISOString(),
        updated_at: fm.updated_at ?? new Date().toISOString(),
        priority: fm.priority ?? 'normal',
        ...sections,
    };
}
function extractSections(body) {
    const positions = [];
    for (const key of SECTION_ORDER) {
        const match = SECTION_HEADERS[key].exec(body);
        if (match && match.index !== undefined) {
            positions.push({ key, index: match.index });
        }
    }
    positions.sort((a, b) => a.index - b.index);
    const result = {
        description: '',
        inputs: '',
        outputs: '',
        notes: '',
        result: '',
    };
    for (let i = 0; i < positions.length; i++) {
        const { key, index } = positions[i];
        const headerMatch = SECTION_HEADERS[key].exec(body);
        if (!headerMatch)
            continue;
        const contentStart = index + headerMatch[0].length;
        const contentEnd = i + 1 < positions.length ? positions[i + 1].index : body.length;
        result[key] = body.slice(contentStart, contentEnd).trim();
    }
    return result;
}
function serializeScope(scope) {
    const fm = {
        scope_id: scope.scope_id,
        title: scope.title,
        phase: scope.phase,
        status: scope.status,
        agent_id: scope.agent_id,
        created_at: scope.created_at,
        updated_at: scope.updated_at,
        priority: scope.priority,
    };
    const body = [
        `## Description\n\n${scope.description || ''}`,
        `## Inputs\n\n${scope.inputs || ''}`,
        `## Outputs\n\n${scope.outputs || ''}`,
        `## Memory / Working Notes\n\n${scope.notes || ''}`,
        `## Result\n\n${scope.result || ''}`,
    ].join('\n\n');
    return gray_matter_1.default.stringify(body, fm);
}
//# sourceMappingURL=scope-parser.js.map