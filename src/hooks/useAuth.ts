import { useState, useEffect } from 'react';
import { authFacade } from '../facades/auth.facade';
import { authStore } from '../state/AuthStore';
import type { AuthState, AuthRequestDto } from '../types/auth.types';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() =>
    authStore.getCurrentAuthState()
  );

  useEffect(() => {
    const subscription = authFacade.getAuthState().subscribe((state) => {
      setAuthState(state);
    });


    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const login = async (credentials: AuthRequestDto) => {
    try {
      await authFacade.login(credentials);
    } catch (error) {
      console.error('[useAuth] Erro ao fazer login:', error);
      throw error;
    }
  };

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
