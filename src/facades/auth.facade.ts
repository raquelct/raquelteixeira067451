
import { authService } from '../services/auth.service';
import { authStore } from '../state/AuthStore';
import type { AuthRequestDto, AuthState, User } from '../types/auth.types';
import type { Observable } from 'rxjs';

export class AuthFacade {
  /**
   * Realiza login completo:
   * 1. Chama o serviço de autenticação
   * 2. Busca dados do usuário (se disponível)
   * 3. Atualiza o store com BehaviorSubject
   * 4. Persiste tokens no localStorage
   */
  async login(credentials: AuthRequestDto): Promise<void> {
    try {
      authStore.setLoading(true);

      // Realiza login e obtém tokens
      const response = await authService.login(credentials);

      // Cria objeto user básico com username
      // Em produção, buscar dados completos via GET /auth/me após login
      const user: User = {
        id: credentials.username,
        name: credentials.username,
        email: `${credentials.username}@pet-registry.com`,
        cpf: '00000000000',
        role: credentials.username === 'admin' ? 'admin' : 'user',
      };

      // Atualiza store com user e tokens
      authStore.setAuth(user, {
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
