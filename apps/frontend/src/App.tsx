import { useState } from 'react';
import { useScopes } from './hooks/useScopes';
import { ScopeCard } from './components/ScopeCard';

function App() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [phaseFilter, setPhaseFilter] = useState<string>('');
  const { scopes, loading, error, refetch } = useScopes(statusFilter, phaseFilter);

  const statuses = ['', 'open', 'active', 'done', 'blocked', 'conflict'];
  const phases = ['', 'analyze', 'design', 'build', 'test', 'deploy', 'monitor', 'iterate'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '32px', marginBottom: '8px' }}>
          Agentic Dev Runtime
        </h1>
        <p style={{ margin: 0, color: '#666' }}>
          Control Plane - Scope Management
        </p>
      </header>

      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        padding: '16px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s || 'All'}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
            Phase:
          </label>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            {phases.map(p => (
              <option key={p} value={p}>{p || 'All'}</option>
            ))}
          </select>
        </div>

        <button
          onClick={refetch}
          style={{
            alignSelf: 'flex-end',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#2196F3',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      {loading && <p>Loading scopes...</p>}
      {error && <p style={{ color: '#F44336' }}>{error}</p>}

      <div>
        {scopes.length === 0 && !loading && (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            No scopes found
          </p>
        )}
        {scopes.map(scope => (
          <ScopeCard key={scope.scope_id} scope={scope} />
        ))}
      </div>
    </div>
  );
}

export default App;
