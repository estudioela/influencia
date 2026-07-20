import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ParceirasListPage from './pages/ParceirasListPage';
import ParceiraFormPage from './pages/ParceiraFormPage';
import ParceiraProfilePage from './pages/ParceiraProfilePage';
import PublicCadastroPage from './pages/PublicCadastroPage';
import AppShell from './components/AppShell';
import { useAuth } from './lib/auth';
import styles from './App.module.css';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <p>Carregando…</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/cadastro" element={<PublicCadastroPage />} />
      {user ? (
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/parceiras" element={<ParceirasListPage />} />
          <Route path="/parceiras/nova" element={<ParceiraFormPage mode="create" />} />
          <Route path="/parceiras/:id" element={<ParceiraProfilePage />} />
          <Route path="/parceiras/:id/editar" element={<ParceiraFormPage mode="edit" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Login />} />
      )}
    </Routes>
  );
}

export default App;
