import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ScopeStore } from '../scopes/scope-store.js';

export function createApiRouter(scopeStore: ScopeStore) {
  const app = new Hono();

  app.use('/*', cors());

  app.get('/scopes', async (c) => {
    const status = c.req.query('status');
    const phase = c.req.query('phase');
    const scopes = await scopeStore.list({ status, phase });
    return c.json({ scopes });
  });

  app.get('/scopes/:scopeId', async (c) => {
    const scopeId = c.req.param('scopeId');
    const scope = await scopeStore.read(scopeId);
    if (!scope) return c.json({ error: 'Scope not found' }, 404);
    return c.json({ scope });
  });

  app.post('/scopes/:scopeId/claim', async (c) => {
    const scopeId = c.req.param('scopeId');
    const { agent_id } = await c.req.json();
    if (!agent_id) return c.json({ error: 'agent_id required' }, 400);

    const success = await scopeStore.claim(scopeId, agent_id);
    if (!success) return c.json({ error: 'Cannot claim scope' }, 400);

    return c.json({ success: true });
  });

  app.patch('/scopes/:scopeId/notes', async (c) => {
    const scopeId = c.req.param('scopeId');
    const { notes } = await c.req.json();
    if (!notes) return c.json({ error: 'notes required' }, 400);

    const success = await scopeStore.appendNotes(scopeId, notes);
    if (!success) return c.json({ error: 'Cannot append notes' }, 404);

    return c.json({ success: true });
  });

  app.post('/scopes/:scopeId/complete', async (c) => {
    const scopeId = c.req.param('scopeId');
    const { result } = await c.req.json();
    if (!result) return c.json({ error: 'result required' }, 400);

    const success = await scopeStore.complete(scopeId, result);
    if (!success) return c.json({ error: 'Cannot complete scope' }, 404);

    return c.json({ success: true });
  });

  app.post('/scopes/:scopeId/block', async (c) => {
    const scopeId = c.req.param('scopeId');
    const { reason } = await c.req.json();
    if (!reason) return c.json({ error: 'reason required' }, 400);

    const success = await scopeStore.block(scopeId, reason);
    if (!success) return c.json({ error: 'Cannot block scope' }, 404);

    return c.json({ success: true });
  });

  app.post('/scopes', async (c) => {
    const scope = await c.req.json();
    await scopeStore.create(scope);
    return c.json({ success: true });
  });

  app.get('/health', (c) => {
    return c.json({ status: 'ok' });
  });

  return app;
}
