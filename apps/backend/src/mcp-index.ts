import { startMcpServer } from './mcp/server';

startMcpServer().catch(err => {
  process.stderr.write(`MCP server error: ${err}\n`);
  process.exit(1);
});
