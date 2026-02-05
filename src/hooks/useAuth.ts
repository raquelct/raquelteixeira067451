import { useState, useEffect } from 'react';
import { authFacade } from '../facades/auth.facade';
import type { User } from '../types/auth.types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(authFacade.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(authFacade.isAuthenticated());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userSub = authFacade.user$.subscribe(setUser);
    const authSub = authFacade.isAuthenticated$.subscribe(setIsAuthenticated);
    const loadingSub = authFacade.isLoading$.subscribe(setIsLoading);

    return () => {
      userSub.unsubscribe();
      authSub.unsubscribe();
      loadingSub.unsubscribe();
    };
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login: authFacade.login.bind(authFacade),
    logout: authFacade.logout.bind(authFacade),
  };
};
