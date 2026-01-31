import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LoadingSpinner } from './components/shared/LoadingSpinner';

// Imports Dinâmicos (Lazy Loading) para otimizar o bundle inicial
const PetList = lazy(() => import('./pages/PetList').then(module => ({ default: module.PetList })));
const PetForm = lazy(() => import('./pages/PetForm').then(module => ({ default: module.PetForm })));
const PetDetails = lazy(() => import('./pages/PetDetails').then(module => ({ default: module.PetDetails })));
const TutorList = lazy(() => import('./pages/TutorList').then(module => ({ default: module.TutorList })));
const TutorForm = lazy(() => import('./pages/TutorForm').then(module => ({ default: module.TutorForm })));

/**
 * Componente principal da aplicação
 * 
 * Features de Nível Sênior:
 * - Roteamento com react-router-dom v6
 * - Code Splitting com React.lazy e Suspense
 * - PetList como Home page (/)
 * - ProtectedRoute reativo com isAuthenticated$ Observable
 * - AppShell para rotas autenticadas
 * - Login fullscreen (sem layout)
 */
function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Suspense fallback={<LoadingSpinner />}>
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

          {/* Rota de Criação de Pet - protegida (ANTES de /pets/:id) */}
          <Route
            path="/pets/new"
            element={
              <ProtectedRoute>
                <AppShell>
                  <PetForm />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Rota de Edição de Pet - protegida (ANTES de /pets/:id) */}
          <Route
            path="/pets/:id/edit"
            element={
              <ProtectedRoute>
                <AppShell>
                  <PetForm />
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

          {/* Rota de Listagem de Tutores - protegida */}
          <Route
            path="/tutores"
            element={
              <ProtectedRoute>
                <AppShell>
                  <TutorList />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Rota de Criação de Tutor - protegida (ANTES de /tutores/:id) */}
          <Route
            path="/tutores/new"
            element={
              <ProtectedRoute>
                <AppShell>
                  <TutorForm />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Rota de Edição de Tutor - protegida (ANTES de /tutores/:id) */}
          <Route
            path="/tutores/:id/edit"
            element={
              <ProtectedRoute>
                <AppShell>
                  <TutorForm />
                </AppShell>
              </ProtectedRoute>
            }
          />

          {/* Rota 404 - Redireciona para home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
