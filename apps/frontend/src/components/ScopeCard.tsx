import { ScopeMetadata } from '../hooks/useScopes';

interface ScopeCardProps {
  scope: ScopeMetadata;
}

export function ScopeCard({ scope }: ScopeCardProps) {
  const statusColors = {
    open: '#4CAF50',
    active: '#2196F3',
    done: '#9E9E9E',
    blocked: '#F44336',
    conflict: '#FF9800'
  };

  const phaseColors = {
    analyze: '#E91E63',
    design: '#9C27B0',
    build: '#3F51B5',
    test: '#00BCD4',
    deploy: '#4CAF50',
    monitor: '#FF9800',
    iterate: '#795548'
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#fff'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>{scope.scope_id}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            backgroundColor: statusColors[scope.status as keyof typeof statusColors] || '#ccc',
            color: '#fff'
          }}>
            {scope.status}
          </span>
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            backgroundColor: phaseColors[scope.phase as keyof typeof phaseColors] || '#ccc',
            color: '#fff'
          }}>
            {scope.phase}
          </span>
        </div>
      </div>
      <p style={{ margin: '8px 0', fontSize: '14px', fontWeight: 500 }}>{scope.title}</p>
      {scope.agent_id && (
        <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
          Agent: {scope.agent_id}
        </p>
      )}
      <p style={{ margin: '4px 0', fontSize: '12px', color: '#999' }}>
        Updated: {new Date(scope.updated_at).toLocaleString()}
      </p>
    </div>
  );
}
