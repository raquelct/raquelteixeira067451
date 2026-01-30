
import { authService } from '../services/auth.service';
import { authStore } from '../state/AuthStore';
import type { LoginCredentials, AuthState } from '../types/auth.types';
import type { Observable } from 'rxjs';

export class AuthFacade {
  /**
   * Realiza login completo:
   * 1. Chama o serviço de autenticação
   * 2. Atualiza o store com BehaviorSubject
   * 3. Persiste tokens no localStorage
   */
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      authStore.setLoading(true);

      const response = await authService.login(credentials);

      authStore.setAuth(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    } catch (error) {
      authStore.setLoading(false);
      throw error;
    }
  }

  /**
   * Realiza logout completo:
   * 1. Chama o serviço de logout
   * 2. Limpa o store
   * 3. Remove tokens do localStorage
   */
  async logout(): Promise<void> {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout na API:', error);
    } finally {
      // Limpa estado local independente do resultado da API
      authStore.clearAuth();
    }
  }

  /**
   * Retorna Observable do estado de autenticação
   */
  getAuthState(): Observable<AuthState> {
    return authStore.getAuthState();
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return authStore.getCurrentAuthState().isAuthenticated;
  }

  /**
   * Obtém informações do usuário atual
   */
  async getCurrentUser(): Promise<void> {
    try {
      const user = await authService.getCurrentUser();
      const currentState = authStore.getCurrentAuthState();

      if (currentState.tokens) {
        authStore.setAuth(user, currentState.tokens);
      }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      // Se falhar ao obter usuário, limpa autenticação
      authStore.clearAuth();
      throw error;
    }
  }
}

// Exporta instância singleton do Facade
export const authFacade = new AuthFacade();
