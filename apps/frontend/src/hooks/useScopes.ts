import { useState, useEffect } from 'react';

export interface ScopeMetadata {
  scope_id: string;
  title: string;
  phase: string;
  status: string;
  agent_id?: string;
  created_at: string;
  updated_at: string;
  priority: string;
}

export function useScopes(status?: string, phase?: string) {
  const [scopes, setScopes] = useState<ScopeMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScopes();
  }, [status, phase]);

  const fetchScopes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (phase) params.append('phase', phase);

      const response = await fetch(`/api/scopes?${params}`);
      const data = await response.json();
      setScopes(data.scopes);
      setError(null);
    } catch (err) {
      setError('Failed to fetch scopes');
    } finally {
      setLoading(false);
    }
  };

  return { scopes, loading, error, refetch: fetchScopes };
}
