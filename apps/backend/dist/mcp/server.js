"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMcpServer = createMcpServer;
exports.startMcpServer = startMcpServer;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const tools_1 = require("./tools");
function createMcpServer() {
    const server = new index_js_1.Server({ name: 'agentic-dev-runtime', version: '1.0.0' }, { capabilities: { tools: {} } });
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
        tools: tools_1.toolDefinitions,
    }));
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        const { name, arguments: args = {} } = request.params;
        const result = await (0, tools_1.handleTool)(name, args);
        return result;
    });
    return server;
}
async function startMcpServer() {
    const server = createMcpServer();
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    process.stderr.write('MCP Control Plane server running on stdio\n');
}
//# sourceMappingURL=server.js.map