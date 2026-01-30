import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { authStore } from './state/AuthStore';
import type { AuthState } from './types/auth.types';

/**
 * Componente principal da aplicação
 * 
 * Features de Nível Sênior:
 * - Roteamento com react-router-dom
 * - Proteção de rotas com ProtectedRoute
 * - AppShell para rotas autenticadas
 * - Login fullscreen (sem layout)
 * - Subscrição ao AuthStore (BehaviorSubject)
 */
function App() {
  const [authState, setAuthState] = useState<AuthState>(
    authStore.getCurrentAuthState()
  );

  useEffect(() => {
    // Subscrição ao AuthStore usando BehaviorSubject
    const subscription = authStore.getAuthState().subscribe((state) => {
      setAuthState(state);
    });

    // Cleanup da subscrição ao desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Routes>
      {/* Rota pública - Login (fullscreen, sem AppShell) */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas com AppShell */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <AppShell>
              <Home />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Placeholder para rotas futuras */}
      <Route
        path="/pets"
        element={
          <ProtectedRoute>
            <AppShell>
              <div className="text-center py-12">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  🐾 Página de Pets
                </h1>
                <p className="text-gray-600">Em desenvolvimento...</p>
              </div>
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/tutores"
        element={
          <ProtectedRoute>
            <AppShell>
              <div className="text-center py-12">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  👥 Página de Tutores
                </h1>
                <p className="text-gray-600">Em desenvolvimento...</p>
              </div>
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Rota raiz - Redireciona baseado em autenticação */}
      <Route
        path="/"
        element={
          authState.isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Rota 404 - Página não encontrada */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
