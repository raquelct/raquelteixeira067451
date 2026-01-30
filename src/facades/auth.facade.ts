
import { authService } from '../services/auth.service';
import { authStore } from '../state/AuthStore';
import type { AuthRequestDto, AuthState, User } from '../types/auth.types';
import type { Observable } from 'rxjs';

/**
 * AuthFacade - Padrão Facade para Autenticação
 * 
 * Features de Nível Sênior:
 * - Interface única para UI components
 * - Orquestra AuthService + AuthStore
 * - Expõe observables reativos granulares
 * - Gestão completa de sessão e tokens
 * - Sincronização automática entre tabs via AuthStore
 */
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
        id: parseInt(credentials.username),
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

  // ========== Observables Reativos ==========

  /**
   * Observable do estado de autenticação completo
   */
  getAuthState(): Observable<AuthState> {
    return authStore.getAuthState();
  }

  /**
   * Observable específico para status de autenticação
   * Emite apenas quando isAuthenticated muda
   */
  get isAuthenticated$(): Observable<boolean> {
    return authStore.isAuthenticated$;
  }

  /**
   * Observable específico para dados do usuário
   */
  get user$(): Observable<User | null> {
    return authStore.user$;
  }

  /**
   * Observable específico para loading state
   */
  get isLoading$(): Observable<boolean> {
    return authStore.isLoading$;
  }

  // ========== Getters Síncronos (Snapshots) ==========

  /**
   * Verifica se o usuário está autenticado (snapshot)
   */
  isAuthenticated(): boolean {
    return authStore.getCurrentAuthState().isAuthenticated;
  }

  /**
   * Obtém usuário atual (snapshot)
   */
  getCurrentUser(): User | null {
    return authStore.getCurrentAuthState().user;
  }

  /**
   * Busca e atualiza informações do usuário atual da API
   */
  async fetchCurrentUser(): Promise<void> {
    try {
      const user = await authService.getCurrentUser();
      const currentState = authStore.getCurrentAuthState();

      if (currentState.tokens) {
        authStore.setAuth(user, currentState.tokens);
      }
    } catch (error) {
      console.error('[AuthFacade] Erro ao buscar usuário atual:', error);
      // Se falhar ao obter usuário, limpa autenticação
      authStore.clearAuth();
      throw error;
    }
  }

  /**
   * Valida se a sessão atual ainda é válida
   * Útil para verificar ao inicializar a app
   */
  async validateSession(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      await this.fetchCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Exporta instância singleton do Facade
export const authFacade = new AuthFacade();
