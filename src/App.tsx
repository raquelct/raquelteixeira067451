import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { ProtectedRoute } from './components/ProtectedRoute';
import { authStore } from './state/AuthStore';
import type { AuthState } from './types/auth.types';

/**
 * Componente principal da aplicação
 * 
 * Features:
 * - Roteamento com react-router-dom
 * - Proteção de rotas com ProtectedRoute
 * - Indicador visual de autenticação
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
    <>
      {/* Indicador de autenticação */}
      {authState.isAuthenticated && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          ✅ Autenticado como {authState.user?.name || authState.user?.email}
        </div>
      )}

      {/* Rotas da aplicação */}
      <Routes>
        {/* Rota pública - Login */}
        <Route path="/login" element={<Login />} />

        {/* Rota protegida - Home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
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
    </>
  );
}

export default App;
