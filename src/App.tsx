import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './pages/Login';
import { PetList } from './pages/PetList';
import { PetForm } from './pages/PetForm';
import { PetDetails } from './pages/PetDetails';
import { TutorList } from './pages/TutorList';
import { TutorForm } from './pages/TutorForm';
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
 * - "/pets/new" → PetForm criar (protegida)
 * - "/pets/:id/edit" → PetForm editar (protegida)
 * - "/pets/:id" → PetDetails (protegida)
 * - "/tutores" → TutorList (protegida)
 * - "/tutores/new" → TutorForm criar (protegida)
 * - "/tutores/:id/edit" → TutorForm editar (protegida)
 * - "/login" → Login (pública)
 * - Todas as rotas protegidas usam AppShell
 */
function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
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
    </>
  );
}

export default App;
