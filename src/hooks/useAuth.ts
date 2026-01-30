import { useState, useEffect } from 'react';
import { authFacade } from '../facades/auth.facade';
import { authStore } from '../state/AuthStore';
import type { AuthState, LoginCredentials } from '../types/auth.types';

/**
 * Hook customizado para autenticação
 * 
 * Usa RxJS Observable do AuthStore para reagir a mudanças de estado
 * em tempo real.
 * 
 * Features:
 * - Estado reativo (re-render automático em mudanças)
 * - Funções auxiliares de login/logout
 * - Type-safe com TypeScript
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * if (!isAuthenticated) {
 *   return <LoginForm onSubmit={login} />;
 * }
 * 
 * return <div>Olá, {user?.name}!</div>;
 * ```
 */
export const useAuth = () => {
  // Obtém estado inicial do AuthStore
  const [authState, setAuthState] = useState<AuthState>(() =>
    authStore.getCurrentAuthState()
  );

  useEffect(() => {
    // Subscreve às mudanças no estado de autenticação via Observable
    const subscription = authFacade.getAuthState().subscribe((state) => {
      setAuthState(state);
    });

    // Cleanup da subscrição quando componente desmonta
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Função auxiliar para login
   */
  const login = async (credentials: LoginCredentials) => {
    try {
      await authFacade.login(credentials);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  /**
   * Função auxiliar para logout
   */
  const logout = async () => {
    try {
      await authFacade.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
  };
};
