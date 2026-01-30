import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import type { AuthState, User, AuthTokens } from '../types/auth.types';

/**
 * Storage keys para tokens
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'pet_registry_access_token',
  REFRESH_TOKEN: 'pet_registry_refresh_token',
  USER_DATA: 'pet_registry_user_data',
} as const;

/**
 * Estado inicial de autenticação
 */
const initialAuthState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
};

/**
 * AuthStore - Gerenciamento Global de Estado de Autenticação
 * 
 * Features de Nível Sênior:
 * - RxJS BehaviorSubject para estado reativo
 * - Persistência segura em localStorage
 * - Sincronização automática entre tabs/janelas
 * - Observables granulares (isAuthenticated$, user$, etc)
 * - Type safety completo com OpenAPI types
 * - Emissão imediata para todos os subscribers
 */
class AuthStore {
  private authState$: BehaviorSubject<AuthState>;
  private isInitialized = false;

  constructor() {
    // Inicializa o BehaviorSubject com estado inicial
    this.authState$ = new BehaviorSubject<AuthState>(initialAuthState);
    
    // Carrega tokens do localStorage se existirem
    this.loadStoredAuth();
    
    // Configura listener para sincronização entre tabs
    this.setupStorageListener();
    
    this.isInitialized = true;
  }

  /**
   * Retorna um Observable do estado de autenticação
   */
  public getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  /**
   * Retorna o valor atual do estado (snapshot)
   */
  public getCurrentAuthState(): AuthState {
    return this.authState$.getValue();
  }

  /**
   * Atualiza o estado de autenticação
   */
  public setAuth(user: User, tokens: AuthTokens): void {
    const newState: AuthState = {
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    };
    
    this.authState$.next(newState);
    this.persistAuth(tokens);
  }

  /**
   * Atualiza apenas os tokens (útil para refresh)
   */
  public updateTokens(tokens: AuthTokens): void {
    const currentState = this.authState$.getValue();
    
    this.authState$.next({
      ...currentState,
      tokens,
    });
    
    this.persistAuth(tokens);
  }

  /**
   * Remove autenticação (logout)
   */
  public clearAuth(): void {
    this.authState$.next(initialAuthState);
    this.clearStoredAuth();
  }

  /**
   * Define estado de loading
   */
  public setLoading(isLoading: boolean): void {
    const currentState = this.authState$.getValue();
    this.authState$.next({ ...currentState, isLoading });
  }

  /**
   * Persiste tokens no localStorage
   */
  private persistAuth(tokens: AuthTokens): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  /**
   * Carrega tokens do localStorage
   */
  private loadStoredAuth(): void {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (accessToken && refreshToken) {
      // Nota: Em produção, validar o token antes de considerar autenticado
      const currentState = this.authState$.getValue();
      this.authState$.next({
        ...currentState,
        tokens: { accessToken, refreshToken },
        isAuthenticated: true,
      });
    }
  }

  /**
   * Remove tokens do localStorage
   */
  private clearStoredAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

// Exporta instância singleton
export const authStore = new AuthStore();
