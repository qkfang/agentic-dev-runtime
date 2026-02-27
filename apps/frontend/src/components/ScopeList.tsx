import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getScopes } from '../api/client';
import { Scope } from '../types';

const STATUSES = ['', 'open', 'active', 'done', 'blocked', 'conflict'];
const PHASES = ['', 'analyze', 'design', 'build', 'test', 'deploy', 'monitor'];

const ScopeList: React.FC = () => {
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    getScopes({
      status: statusFilter || undefined,
      phase: phaseFilter || undefined,
    })
      .then((data) => {
        setScopes(data);
        setError(null);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : 'Failed to load scopes')
      )
      .finally(() => setLoading(false));
  }, [statusFilter, phaseFilter]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Scopes</h1>
      </div>

      <div className="filters">
        <label className="filter-label">
          Status:
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s || 'All'}
              </option>
            ))}
          </select>
        </label>
        <label className="filter-label">
          Phase:
          <select
            className="filter-select"
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
          >
            {PHASES.map((p) => (
              <option key={p} value={p}>
                {p || 'All'}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="page-loading">Loading scopes…</div>
      ) : scopes.length === 0 ? (
        <div className="card">
          <p className="empty-msg">No scopes found.</p>
        </div>
      ) : (
        <div className="card table-card">
          <table className="scope-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Phase</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Agent</th>
              </tr>
            </thead>
            <tbody>
              {scopes.map((scope) => (
                <tr key={scope.scope_id}>
                  <td>
                    <Link
                      to={`/scopes/${scope.scope_id}`}
                      className="scope-link"
                    >
                      {scope.title}
                    </Link>
                  </td>
                  <td>{scope.phase}</td>
                  <td>
                    <span className={`badge badge-${scope.status}`}>
                      {scope.status}
                    </span>
                  </td>
                  <td>
                    <span className={`priority priority-${scope.priority}`}>
                      {scope.priority}
                    </span>
                  </td>
                  <td>{scope.agent_id || <span className="muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScopeList;
