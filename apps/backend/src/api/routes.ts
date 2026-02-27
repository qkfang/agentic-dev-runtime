import { Router, Request, Response } from 'express';
import * as store from '../scopes/scope-store';
import { generateScopeId } from '../scopes/scope-types';
import { BOOTSTRAP_PHASES, PHASE_METADATA, truncateAtWordBoundary } from '../scopes/bootstrap-config';

const router = Router();

// POST /bootstrap
router.post('/bootstrap', (req: Request, res: Response) => {
  try {
    const requirements: string =
      typeof req.body === 'string' ? req.body : req.body?.requirements ?? req.body?.text ?? '';

    if (!requirements || requirements.trim().length === 0) {
      res.status(400).json({ error: 'requirements text is required' });
      return;
    }

    const existing = store.list();
    const nextIndex = existing.length + 1;

    const created = [];
    for (let i = 0; i < BOOTSTRAP_PHASES.length; i++) {
      const phase = BOOTSTRAP_PHASES[i];
      const meta = PHASE_METADATA[phase];
      const scope_id = generateScopeId(nextIndex + i);

      const scope = store.create({
        scope_id,
        title: meta.title,
        phase,
        priority: 'normal',
        description: `${meta.description}\n\nRequirements context:\n${truncateAtWordBoundary(requirements, 500)}`,
        inputs: i === 0
          ? '- requirements.md (provided via bootstrap)'
          : `- scope: ${generateScopeId(nextIndex + i - 1)} (previous phase output)`,
        outputs: meta.outputs,
      });

      created.push({ scope_id: scope.scope_id, title: scope.title, phase: scope.phase });
    }

    res.status(201).json({
      message: `Created ${created.length} scope files`,
      scopes: created,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /scopes
router.get('/scopes', (req: Request, res: Response) => {
  try {
    const filters: store.ListFilters = {};
    if (req.query.status) filters.status = String(req.query.status);
    if (req.query.phase) filters.phase = String(req.query.phase);

    const scopes = store.list(filters);
    const summary = scopes.map(s => ({
      scope_id: s.scope_id,
      title: s.title,
      phase: s.phase,
      status: s.status,
      agent_id: s.agent_id,
      priority: s.priority,
      created_at: s.created_at,
      updated_at: s.updated_at,
    }));

    res.json({ scopes: summary, total: summary.length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /scopes/:scope_id
router.get('/scopes/:scope_id', (req: Request, res: Response) => {
  try {
    const scope = store.read(req.params.scope_id);
    if (!scope) {
      res.status(404).json({ error: `Scope ${req.params.scope_id} not found` });
      return;
    }
    res.json(scope);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /scopes/:scope_id/claim
router.post('/scopes/:scope_id/claim', (req: Request, res: Response) => {
  try {
    const agent_id: string = req.body?.agent_id ?? '';
    if (!agent_id) {
      res.status(400).json({ error: 'agent_id is required' });
      return;
    }

    const result = store.claim(req.params.scope_id, agent_id);
    if (!result.success) {
      res.status(409).json({ error: result.error });
      return;
    }

    res.json({ message: 'Scope claimed successfully', scope: result.scope });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PATCH /scopes/:scope_id/notes
router.patch('/scopes/:scope_id/notes', (req: Request, res: Response) => {
  try {
    const notes: string = req.body?.notes ?? '';
    if (!notes) {
      res.status(400).json({ error: 'notes is required' });
      return;
    }

    const scope = store.appendNotes(req.params.scope_id, notes);
    if (!scope) {
      res.status(404).json({ error: `Scope ${req.params.scope_id} not found` });
      return;
    }

    res.json({ message: 'Notes appended', scope });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /scopes/:scope_id/complete
router.post('/scopes/:scope_id/complete', (req: Request, res: Response) => {
  try {
    const result: string = req.body?.result ?? '';
    if (!result) {
      res.status(400).json({ error: 'result is required' });
      return;
    }

    const scope = store.complete(req.params.scope_id, result);
    if (!scope) {
      res.status(404).json({ error: `Scope ${req.params.scope_id} not found` });
      return;
    }

    res.json({ message: 'Scope completed', scope });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /scopes/:scope_id/block
router.post('/scopes/:scope_id/block', (req: Request, res: Response) => {
  try {
    const reason: string = req.body?.reason ?? '';
    if (!reason) {
      res.status(400).json({ error: 'reason is required' });
      return;
    }

    const scope = store.block(req.params.scope_id, reason);
    if (!scope) {
      res.status(404).json({ error: `Scope ${req.params.scope_id} not found` });
      return;
    }

    res.json({ message: 'Scope blocked', scope });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /project/status
router.get('/project/status', (_req: Request, res: Response) => {
  try {
    const status = store.getStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /project/triage
router.post('/project/triage', (_req: Request, res: Response) => {
  try {
    const scopes = store.list();
    const suggestions: string[] = [];

    const byPhase: Record<string, typeof scopes> = {};
    for (const s of scopes) {
      if (!byPhase[s.phase]) byPhase[s.phase] = [];
      byPhase[s.phase].push(s);
    }

    // Detect phases with no open/active scopes that have done predecessors
    const phaseOrder = ['analyze', 'design', 'build', 'test', 'deploy', 'monitor'];
    for (let i = 1; i < phaseOrder.length; i++) {
      const prevPhase = phaseOrder[i - 1];
      const currPhase = phaseOrder[i];
      const prevScopes = byPhase[prevPhase] ?? [];
      const currScopes = byPhase[currPhase] ?? [];

      const prevAllDone = prevScopes.length > 0 && prevScopes.every(s => s.status === 'done');
      const currHasOpen = currScopes.some(s => s.status === 'open' || s.status === 'active');

      if (prevAllDone && !currHasOpen && currScopes.length === 0) {
        suggestions.push(`Phase "${prevPhase}" is complete but no scopes exist for phase "${currPhase}"`);
      }
    }

    // Detect blocked scopes with no follow-up
    const blocked = scopes.filter(s => s.status === 'blocked');
    for (const s of blocked) {
      suggestions.push(`Scope ${s.scope_id} (${s.title}) is blocked — consider creating a follow-up scope`);
    }

    // Detect if there are no scopes at all
    if (scopes.length === 0) {
      suggestions.push('No scopes found. Use POST /bootstrap to initialize the project.');
    }

    // Detect long-running active scopes (updated more than 24h ago)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const staleActive = scopes.filter(s => s.status === 'active' && s.updated_at < oneDayAgo);
    for (const s of staleActive) {
      suggestions.push(`Scope ${s.scope_id} (${s.title}) has been active since ${s.updated_at} — may be stale`);
    }

    res.json({
      suggestions,
      total_suggestions: suggestions.length,
      scopes_reviewed: scopes.length,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
