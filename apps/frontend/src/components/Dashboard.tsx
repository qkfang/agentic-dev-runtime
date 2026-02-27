import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getProjectStatus, triageProject } from '../api/client';
import { ProjectStatus, Scope } from '../types';

const Dashboard: React.FC = () => {
  const [status, setStatus] = useState<ProjectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triageMsg, setTriageMsg] = useState<string | null>(null);
  const [triaging, setTriaging] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getProjectStatus();
      setStatus(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load project status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleTriage = async () => {
    setTriaging(true);
    setTriageMsg(null);
    try {
      const res = await triageProject();
      setTriageMsg(res.message || 'Triage complete');
      await fetchStatus();
    } catch (e) {
      setTriageMsg(e instanceof Error ? e.message : 'Triage failed');
    } finally {
      setTriaging(false);
    }
  };

  if (loading) return <div className="page-loading">Loading dashboard…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Project Dashboard</h1>
        <button
          className="btn btn-primary"
          onClick={handleTriage}
          disabled={triaging}
        >
          {triaging ? 'Triaging…' : '⟳ Triage'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {triageMsg && <div className="alert alert-success">{triageMsg}</div>}

      {status && (
        <>
          <div className="summary-grid">
            {(
              ['open', 'active', 'done', 'blocked', 'conflict'] as const
            ).map((key) => (
              <div key={key} className={`summary-card summary-card-${key}`}>
                <div className="summary-count">{status.summary[key]}</div>
                <div className="summary-label">{key.toUpperCase()}</div>
              </div>
            ))}
            <div className="summary-card summary-card-total">
              <div className="summary-count">{status.summary.total}</div>
              <div className="summary-label">TOTAL</div>
            </div>
          </div>

          <div className="section-grid">
            <ScopeSection
              title="🟢 Active Scopes"
              scopes={status.activeScopes}
              emptyMsg="No active scopes"
            />
            <ScopeSection
              title="🟠 Blocked Scopes"
              scopes={status.blockedScopes}
              emptyMsg="No blocked scopes"
            />
          </div>
        </>
      )}
    </div>
  );
};

const ScopeSection: React.FC<{
  title: string;
  scopes: Scope[];
  emptyMsg: string;
}> = ({ title, scopes, emptyMsg }) => (
  <div className="card">
    <h2 className="card-title">{title}</h2>
    {scopes.length === 0 ? (
      <p className="empty-msg">{emptyMsg}</p>
    ) : (
      <ul className="scope-list">
        {scopes.map((s) => (
          <li key={s.scope_id} className="scope-list-item">
            <div className="scope-list-main">
              <Link to={`/scopes/${s.scope_id}`} className="scope-link">
                {s.title}
              </Link>
              <span className="scope-phase">{s.phase}</span>
            </div>
            {s.agent_id && (
              <div className="scope-agent">Agent: {s.agent_id}</div>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default Dashboard;
