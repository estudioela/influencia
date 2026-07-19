import Login from './pages/Login';
import { useAuth } from './lib/auth';

function App() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <p style={{ fontFamily: 'monospace', padding: '2rem' }}>Carregando…</p>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <h1>TEAR V2</h1>
      <p>
        Autenticado como {user.email} — {user.role ?? 'sem role'}
      </p>
      <button type="button" onClick={() => void logout()}>
        sair
      </button>
    </main>
  );
}

export default App;
