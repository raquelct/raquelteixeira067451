import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/login/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { useAuth } from './hooks/useAuth';

const PetList = lazy(() => import('./pages/pet/PetListPage').then(m => ({ default: m.PetList })));
const PetForm = lazy(() => import('./pages/pet/PetFormPage').then(m => ({ default: m.PetForm })));
const PetDetails = lazy(() => import('./pages/pet/PetDetailsPage').then(m => ({ default: m.PetDetails })));
const TutorList = lazy(() => import('./pages/tutor/TutorListPage').then(m => ({ default: m.TutorList })));
const TutorForm = lazy(() => import('./pages/tutor/TutorFormPage').then(m => ({ default: m.TutorForm })));
const TutorDetails = lazy(() => import('./pages/tutor/TutorDetailsPage').then(m => ({ default: m.TutorDetails })));
const StatusPage = lazy(() => import('./pages/status/StatusPage').then(m => ({ default: m.StatusPage })));

const PublicRoute = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
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
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route path="/status" element={<StatusPage />} />

      <Route element={<AuthenticatedLayout />}>
        <Route path="/" element={<PetList />} />
        
        <Route path="/pets/new" element={<PetForm />} />
        <Route path="/pets/:id/edit" element={<PetForm />} />
        <Route path="/pets/:id" element={<PetDetails />} />

        <Route path="/tutores" element={<TutorList />} />
        <Route path="/tutores/new" element={<TutorForm />} />
        <Route path="/tutores/:id/edit" element={<TutorForm />} />
        <Route path="/tutores/:id" element={<TutorDetails />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};