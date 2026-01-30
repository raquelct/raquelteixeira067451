import { Navigate } from 'react-router-dom';
import { authFacade } from '../facades/auth.facade';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente de Proteção de Rota
 * 
 * Verifica se o usuário está autenticado.
 * Se não estiver, redireciona para /login.
 * 
 * Usa AuthFacade para verificar autenticação.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = authFacade.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
