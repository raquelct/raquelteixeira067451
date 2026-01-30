import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { PetList } from './pages/PetList';
import { PetDetails } from './pages/PetDetails';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

/**
 * Componente principal da aplicação
 * 
 * Features de Nível Sênior:
 * - Roteamento com react-router-dom v6
 * - PetList como Home page (/)
 * - ProtectedRoute reativo com isAuthenticated$ Observable
 * - AppShell para rotas autenticadas
 * - Login fullscreen (sem layout)
 * 
 * Arquitetura:
 * - "/" → PetList (protegida)
 * - "/pets/:id" → PetDetails (protegida)
 * - "/login" → Login (pública)
 * - "/tutores" → Tutores (protegida)
 * - Todas as rotas protegidas usam AppShell
 */
function App() {
  return (
    <Routes>
      {/* Rota pública - Login (fullscreen, sem AppShell) */}
      <Route path="/login" element={<Login />} />

      {/* Rota raiz - PetList (Home) protegida */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell>
              <PetList />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Rota de Detalhes do Pet - protegida */}
      <Route
        path="/pets/:id"
        element={
          <ProtectedRoute>
            <AppShell>
              <PetDetails />
            </AppShell>
          </ProtectedRoute>
        }
      />

      {/* Rota de Tutores - protegida */}
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

      {/* Rota 404 - Redireciona para home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
