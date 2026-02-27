"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./mcp/server");
(0, server_1.startMcpServer)().catch(err => {
    process.stderr.write(`MCP server error: ${err}\n`);
    process.exit(1);
});
//# sourceMappingURL=mcp-index.js.map