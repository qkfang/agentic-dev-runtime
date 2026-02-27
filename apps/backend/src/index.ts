import { serve } from '@hono/node-server';
import path from 'path';
import { fileURLToPath } from 'url';
import { ScopeStore } from './scopes/scope-store.js';
import { createApiRouter } from './api/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceDir = process.env.WORKSPACE_DIR || path.join(__dirname, '../../workspace');
const port = Number(process.env.PORT) || 3001;

async function main() {
  const scopeStore = new ScopeStore(workspaceDir);
  await scopeStore.initialize();

  const app = createApiRouter(scopeStore);

  console.log(`Control Plane API starting on port ${port}`);
  console.log(`Workspace: ${workspaceDir}`);

  serve({
    fetch: app.fetch,
    port
  });
}

main().catch(console.error);
