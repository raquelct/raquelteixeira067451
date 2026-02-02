import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { authFacade } from './facades/auth.facade';

const PetList = lazy(() => import('./pages/PetList').then(m => ({ default: m.PetList })));
const PetForm = lazy(() => import('./pages/PetForm').then(m => ({ default: m.PetForm })));
const PetDetails = lazy(() => import('./pages/PetDetails').then(m => ({ default: m.PetDetails })));
const TutorList = lazy(() => import('./pages/TutorList').then(m => ({ default: m.TutorList })));
const TutorForm = lazy(() => import('./pages/TutorForm').then(m => ({ default: m.TutorForm })));
const TutorDetails = lazy(() => import('./pages/TutorDetails').then(m => ({ default: m.TutorDetails })));
const StatusPage = lazy(() => import('./pages/StatusPage').then(m => ({ default: m.StatusPage })));

const PublicRoute = () => {
  if (authFacade.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

const AuthenticatedLayout = () => {
  return (
    <ProtectedRoute>
      <AppShell>
        <Suspense fallback={<LoadingSpinner />}>
          <Outlet />
        </Suspense>
      </AppShell>
    </ProtectedRoute>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Rotas Públicas (Login) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Rota Pública e Privada (Acessível por todos) */}
      <Route path="/status" element={<StatusPage />} />

      {/* 2. Rotas Privadas (Com AppShell) */}
      <Route element={<AuthenticatedLayout />}>
        <Route path="/" element={<PetList />} />
        
        {/* Rotas de Pets */}
        <Route path="/pets/new" element={<PetForm />} />
        <Route path="/pets/:id/edit" element={<PetForm />} />
        <Route path="/pets/:id" element={<PetDetails />} />

        {/* Rotas de Tutores */}
        <Route path="/tutores" element={<TutorList />} />
        <Route path="/tutores/new" element={<TutorForm />} />
        <Route path="/tutores/:id/edit" element={<TutorForm />} />
        <Route path="/tutores/:id" element={<TutorDetails />} />
      </Route>

      {/* 3. Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};