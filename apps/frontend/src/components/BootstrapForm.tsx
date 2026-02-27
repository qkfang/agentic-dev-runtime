import React, { useState } from 'react';
import { bootstrapProject } from '../api/client';
import { Scope } from '../types';

const BootstrapForm: React.FC = () => {
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdScopes, setCreatedScopes] = useState<Scope[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirements.trim()) return;
    setLoading(true);
    setError(null);
    setCreatedScopes(null);
    try {
      const result = await bootstrapProject(requirements.trim());
      setCreatedScopes(result.scopes);
      setRequirements('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bootstrap failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Bootstrap Project</h1>
      </div>
      <p className="page-description">
        Paste your project requirements in Markdown format below. The control
        plane will parse them and create an initial set of scopes.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <label className="form-label">Requirements (Markdown)</label>
          <textarea
            className="form-textarea bootstrap-textarea"
            placeholder={`# Project Requirements\n\n## Feature 1\n...\n\n## Feature 2\n...`}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={18}
            disabled={loading}
          />
          <div className="form-footer">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || !requirements.trim()}
            >
              {loading ? '⏳ Bootstrapping…' : '🚀 Bootstrap Project'}
            </button>
          </div>
        </form>
      </div>

      {createdScopes && (
        <div className="card">
          <h2 className="card-title">
            ✅ Bootstrap Complete — {createdScopes.length} scope
            {createdScopes.length !== 1 ? 's' : ''} created
          </h2>
          <table className="scope-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Phase</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {createdScopes.map((s) => (
                <tr key={s.scope_id}>
                  <td>{s.title}</td>
                  <td>{s.phase}</td>
                  <td>
                    <span className={`priority priority-${s.priority}`}>
                      {s.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${s.status}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BootstrapForm;
