import { authService } from '../services/auth.service';
import { authStore } from '../state/AuthStore';
import type { AuthRequestDto, AuthState, User } from '../types/auth.types';
import type { Observable } from 'rxjs';

export class AuthFacade {
  async login(credentials: AuthRequestDto): Promise<void> {
    try {
      authStore.setLoading(true);

      const response = await authService.login(credentials);

      const user: User = {
        id: parseInt(credentials.username),
        name: credentials.username,
        email: `${credentials.username}@pet-registry.com`,
        cpf: '00000000000',
        role: credentials.username === 'admin' ? 'admin' : 'user',
      };

      authStore.setAuth(user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    } catch (error) {
      authStore.setLoading(false);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await authService.logout();
    authStore.clearAuth();

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  getAuthState(): Observable<AuthState> {
    return authStore.getAuthState();
  }

  get isAuthenticated$(): Observable<boolean> {
    return authStore.isAuthenticated$;
  }

  get user$(): Observable<User | null> {
    return authStore.user$;
  }

  get isLoading$(): Observable<boolean> {
    return authStore.isLoading$;
  }

  isAuthenticated(): boolean {
    return authStore.getCurrentAuthState().isAuthenticated;
  }

  getCurrentUser(): User | null {
    return authStore.getCurrentAuthState().user;
  }

  async fetchCurrentUser(): Promise<void> {
    try {
      const user = await authService.getCurrentUser();
      const currentState = authStore.getCurrentAuthState();

      if (currentState.tokens) {
        authStore.setAuth(user, currentState.tokens);
      }
    } catch (error) {
      console.error('[AuthFacade] Erro ao buscar usuário atual:', error);
      authStore.clearAuth();
      throw error;
    }
  }

  async validateSession(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      await this.fetchCurrentUser();
      return true;
    } catch (error) {
      console.debug('[AuthFacade] Session validation failed:', error);
      return false;
    }
  }
}

export const authFacade = new AuthFacade();
