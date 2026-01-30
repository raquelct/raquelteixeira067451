import { useState, useEffect } from 'react';
import { authFacade } from '../facades/auth.facade';
import { authStore } from '../state/AuthStore';
import type { AuthState, AuthRequestDto } from '../types/auth.types';

/**
 * Hook customizado para autenticação com RxJS Observables
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
 * const { user, isAuthenticated, isLoading, login, logout } = useAuth();
 * 
 * if (isLoading) return <Loading />;
 * if (!isAuthenticated) return <LoginForm onSubmit={login} />;
 * return <div>Olá, {user?.name}!</div>;
 * ```
 */
export const useAuth = () => {
  // Obtém estado inicial do AuthStore (snapshot)
  const [authState, setAuthState] = useState<AuthState>(() =>
    authStore.getCurrentAuthState()
  );

  useEffect(() => {
    // Subscreve ao Observable do estado completo
    // Alternativa: usar observables granulares (isAuthenticated$, user$, etc)
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
   * Type-safe com AuthRequestDto do OpenAPI
   */
  const login = async (credentials: AuthRequestDto) => {
    try {
      await authFacade.login(credentials);
    } catch (error) {
      console.error('[useAuth] Erro ao fazer login:', error);
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
