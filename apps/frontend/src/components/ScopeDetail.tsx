import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getScope,
  claimScope,
  appendNotes,
  completeScope,
  blockScope,
} from '../api/client';
import { Scope } from '../types';

type ActionPanel = 'claim' | 'notes' | 'complete' | 'block' | null;

const ScopeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [scope, setScope] = useState<Scope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<ActionPanel>(null);
  const [submitting, setSubmitting] = useState(false);

  // form state
  const [agentId, setAgentId] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState('');
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getScope(id)
      .then((data) => {
        setScope(data);
        setError(null);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Failed to load scope')
      )
      .finally(() => setLoading(false));
  }, [id]);

  const refresh = async () => {
    if (!id) return;
    const data = await getScope(id);
    setScope(data);
  };

  const openPanel = (panel: ActionPanel) => {
    setActivePanel(activePanel === panel ? null : panel);
    setActionError(null);
    setSuccessMsg(null);
  };

  const handleClaim = async () => {
    if (!id || !agentId.trim()) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await claimScope(id, agentId.trim());
      setSuccessMsg('Scope claimed successfully');
      setActivePanel(null);
      setAgentId('');
      await refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Claim failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotes = async () => {
    if (!id || !notes.trim()) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await appendNotes(id, notes.trim());
      setSuccessMsg('Notes added successfully');
      setActivePanel(null);
      setNotes('');
      await refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to add notes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!id || !result.trim()) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await completeScope(id, result.trim());
      setSuccessMsg('Scope completed successfully');
      setActivePanel(null);
      setResult('');
      await refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Complete failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlock = async () => {
    if (!id || !blockReason.trim()) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await blockScope(id, blockReason.trim());
      setSuccessMsg('Scope blocked');
      setActivePanel(null);
      setBlockReason('');
      await refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Block failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading">Loading scope…</div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;
  if (!scope) return null;

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-ghost" onClick={() => navigate('/scopes')}>
          ← Back
        </button>
        <h1>{scope.title}</h1>
      </div>

      {successMsg && <div className="alert alert-success">{successMsg}</div>}
      {actionError && <div className="alert alert-error">{actionError}</div>}

      <div className="detail-meta card">
        <div className="meta-grid">
          <div className="meta-item">
            <span className="meta-label">Status</span>
            <span className={`badge badge-${scope.status}`}>{scope.status}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Phase</span>
            <span className="meta-value">{scope.phase}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Priority</span>
            <span className={`priority priority-${scope.priority}`}>{scope.priority}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Agent</span>
            <span className="meta-value">{scope.agent_id || <span className="muted">unassigned</span>}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Created</span>
            <span className="meta-value">{new Date(scope.created_at).toLocaleString()}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Updated</span>
            <span className="meta-value">{new Date(scope.updated_at).toLocaleString()}</span>
          </div>
          <div className="meta-item meta-item-full">
            <span className="meta-label">Scope ID</span>
            <span className="meta-value meta-mono">{scope.scope_id}</span>
          </div>
        </div>
      </div>

      {scope.content && (
        <div className="card">
          <h2 className="card-title">Content</h2>
          <pre className="scope-content">{scope.content}</pre>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Actions</h2>
        <div className="action-buttons">
          {scope.status === 'open' && (
            <button
              className={`btn btn-primary ${activePanel === 'claim' ? 'active' : ''}`}
              onClick={() => openPanel('claim')}
            >
              Claim
            </button>
          )}
          <button
            className={`btn btn-secondary ${activePanel === 'notes' ? 'active' : ''}`}
            onClick={() => openPanel('notes')}
          >
            Add Notes
          </button>
          {scope.status === 'active' && (
            <button
              className={`btn btn-success ${activePanel === 'complete' ? 'active' : ''}`}
              onClick={() => openPanel('complete')}
            >
              Complete
            </button>
          )}
          <button
            className={`btn btn-warning ${activePanel === 'block' ? 'active' : ''}`}
            onClick={() => openPanel('block')}
          >
            Block
          </button>
        </div>

        {activePanel === 'claim' && (
          <div className="action-panel">
            <label className="form-label">Agent ID</label>
            <input
              className="form-input"
              type="text"
              placeholder="Enter agent ID…"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
            />
            <div className="action-panel-footer">
              <button
                className="btn btn-primary"
                onClick={handleClaim}
                disabled={submitting || !agentId.trim()}
              >
                {submitting ? 'Claiming…' : 'Confirm Claim'}
              </button>
              <button className="btn btn-ghost" onClick={() => setActivePanel(null)}>Cancel</button>
            </div>
          </div>
        )}

        {activePanel === 'notes' && (
          <div className="action-panel">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Enter notes to append…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <div className="action-panel-footer">
              <button
                className="btn btn-secondary"
                onClick={handleNotes}
                disabled={submitting || !notes.trim()}
              >
                {submitting ? 'Saving…' : 'Save Notes'}
              </button>
              <button className="btn btn-ghost" onClick={() => setActivePanel(null)}>Cancel</button>
            </div>
          </div>
        )}

        {activePanel === 'complete' && (
          <div className="action-panel">
            <label className="form-label">Result</label>
            <textarea
              className="form-textarea"
              placeholder="Describe what was accomplished…"
              value={result}
              onChange={(e) => setResult(e.target.value)}
              rows={4}
            />
            <div className="action-panel-footer">
              <button
                className="btn btn-success"
                onClick={handleComplete}
                disabled={submitting || !result.trim()}
              >
                {submitting ? 'Completing…' : 'Mark Complete'}
              </button>
              <button className="btn btn-ghost" onClick={() => setActivePanel(null)}>Cancel</button>
            </div>
          </div>
        )}

        {activePanel === 'block' && (
          <div className="action-panel">
            <label className="form-label">Block Reason</label>
            <textarea
              className="form-textarea"
              placeholder="Describe why this scope is blocked…"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows={3}
            />
            <div className="action-panel-footer">
              <button
                className="btn btn-warning"
                onClick={handleBlock}
                disabled={submitting || !blockReason.trim()}
              >
                {submitting ? 'Blocking…' : 'Confirm Block'}
              </button>
              <button className="btn btn-ghost" onClick={() => setActivePanel(null)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScopeDetail;
