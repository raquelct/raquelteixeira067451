import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authFacade } from '../facades/auth.facade';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente de Proteção de Rota - Nível Sênior
 * 
 * Features:
 * - Subscribe ao Observable isAuthenticated$ (reativo)
 * - Redireciona para /login se não autenticado
 * - Loading state para evitar flash de redirecionamento
 * - Usa AuthFacade (Facade Pattern)
 * 
 * Arquitetura:
 * Component → AuthFacade → AuthStore → BehaviorSubject
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Subscribe ao Observable isAuthenticated$
    const subscription = authFacade.isAuthenticated$.subscribe(
      (authenticated) => {
        setIsAuthenticated(authenticated);
      }
    );

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Loading state - evita flash de redirecionamento
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Não autenticado - redireciona
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Autenticado - renderiza filhos
  return <>{children}</>;
};
