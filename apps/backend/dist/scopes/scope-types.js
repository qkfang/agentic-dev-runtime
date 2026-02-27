"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScopeId = generateScopeId;
exports.generateFilename = generateFilename;
function generateScopeId(index) {
    const num = String(index).padStart(3, '0');
    return `S${num}`;
}
function generateFilename(scope_id, title) {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50)
        .replace(/-$/, '');
    return `${scope_id}-${slug}.md`;
}
//# sourceMappingURL=scope-types.js.map