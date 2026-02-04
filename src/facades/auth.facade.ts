import { authService } from '../services/auth.service';
import { authStore } from '../state/AuthStore';
import type { AuthRequestDto, AuthState, User } from '../types/auth.types';
import type { Observable } from 'rxjs';
import { BaseFacade } from './base/BaseFacade';
import { ROUTES } from '../constants/routes';
import { USER_ROLES } from '../constants/roles';

export class AuthFacade extends BaseFacade<typeof authStore> {
  protected store = authStore;

  async login(credentials: AuthRequestDto): Promise<void> {
    return this.executeWithLoading(async () => {
      const response = await authService.login(credentials);

      const user: User = {
        id: parseInt(credentials.username, 10),
        name: credentials.username,
        email: `${credentials.username}@pet-registry.com`,
        cpf: '00000000000',
        role: credentials.username === USER_ROLES.ADMIN ? USER_ROLES.ADMIN : USER_ROLES.USER,
      };

      authStore.setAuth(user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    });
  }

  async logout(): Promise<void> {
    await authService.logout();
    authStore.clearAuth();

    if (typeof window !== 'undefined') {
      window.location.href = ROUTES.LOGIN;
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
    const user = await authService.getCurrentUser();
    const currentState = authStore.getCurrentAuthState();

    if (currentState.tokens) {
      authStore.setAuth(user, currentState.tokens);
    }
  }

  async validateSession(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      await this.fetchCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

export const authFacade = new AuthFacade();
