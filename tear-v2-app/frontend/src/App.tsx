import { useEffect, useState } from 'react';
import { apiClient } from './lib/apiClient';

type HealthResponse = {
  status: string;
  app: string;
};

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<HealthResponse>('/health')
      .then((response) => setHealth(response.data))
      .catch(() => setError('Não foi possível conectar à API.'));
  }, []);

  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>TEAR V2 — smoke test de conectividade</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && !health && <p>Consultando /api/health…</p>}
      {health && <pre>{JSON.stringify(health, null, 2)}</pre>}
    </main>
  );
}

export default App;
