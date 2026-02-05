import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authFacade } from './auth.facade';
import { authService } from '../services/auth.service';
import { authStore } from '../state/AuthStore';
import { ROUTES } from '../constants/routes';
import { USER_ROLES } from '../constants/roles';
import type { User, AuthRequestDto } from '../types/auth.types';

vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  }
}));

describe('AuthFacade', () => {
  beforeEach(() => {
    authStore.clearAuth();
    vi.clearAllMocks();
    
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
  });

  describe('login', () => {
    it('should login successfully and update store', async () => {
      const credentials: AuthRequestDto = { username: 'admin', password: '123' };
      const authResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        refreshExpiresIn: 7200
      };

      vi.mocked(authService.login).mockResolvedValue(authResponse);

      const storeSpy = vi.spyOn(authStore, 'setAuth');

      await authFacade.login(credentials);

      expect(authService.login).toHaveBeenCalledWith(credentials);
      expect(storeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(Number),
          name: 'admin',
          role: USER_ROLES.ADMIN
        }),
        expect.objectContaining({
          accessToken: 'access-token',
          refreshToken: 'refresh-token'
        })
      );
    });
  });

  describe('logout', () => {
    it('should clear store and redirect to login', async () => {
      await authFacade.logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(authStore.getCurrentAuthState().isAuthenticated).toBe(false);
      expect(window.location.href).toBe(ROUTES.LOGIN);
    });
  });

  describe('Reactive State', () => {
    it('should emit user updates via user$', async () => {
      const user: User = { 
        id: 1, 
        name: 'Test', 
        email: 'test@test.com', 
        cpf: '123', 
        role: USER_ROLES.USER
      };
      
      const userPromise = new Promise<User | null>(resolve => {
        authFacade.user$.subscribe(u => {
            if (u) resolve(u);
        });
      });

      authStore.setAuth(user, { accessToken: 'a', refreshToken: 'b' });

      const result = await userPromise;
      expect(result).toEqual(user);
    });
  });
});
