import { useState, type FormEvent } from 'react';
import { useAuth } from '../lib/auth';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch {
      setError('Email ou senha inválidos.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: 320 }}>
      <h1>TEAR V2 — login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">email</label>
          <br />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <label htmlFor="password">senha</label>
          <br />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={isSubmitting} style={{ marginTop: 12 }}>
          {isSubmitting ? 'entrando…' : 'entrar'}
        </button>
      </form>
    </main>
  );
}
