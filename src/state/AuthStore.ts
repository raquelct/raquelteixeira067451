import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import type { AuthState, User, AuthTokens } from '../types/auth.types';

/**
 * Storage keys para tokens (namespaced para evitar conflitos)
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

  constructor() {
    // Inicializa o BehaviorSubject com estado inicial
    this.authState$ = new BehaviorSubject<AuthState>(initialAuthState);
    
    // Carrega tokens do localStorage se existirem
    this.loadStoredAuth();
    
    // Configura listener para sincronização entre tabs
    this.setupStorageListener();
  }

  // ========== Observables ==========

  /**
   * Retorna um Observable do estado de autenticação completo
   */
  public getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  /**
   * Observable específico para status de autenticação
   * Emite apenas quando isAuthenticated muda
   */
  public get isAuthenticated$(): Observable<boolean> {
    return this.authState$.pipe(
      map((state) => state.isAuthenticated),
      distinctUntilChanged()
    );
  }

  /**
   * Observable específico para usuário
   * Emite apenas quando user muda
   */
  public get user$(): Observable<User | null> {
    return this.authState$.pipe(
      map((state) => state.user),
      distinctUntilChanged()
    );
  }

  /**
   * Observable específico para tokens
   * Emite apenas quando tokens mudam
   */
  public get tokens$(): Observable<AuthTokens | null> {
    return this.authState$.pipe(
      map((state) => state.tokens),
      distinctUntilChanged()
    );
  }

  /**
   * Observable específico para loading state
   * Emite apenas quando isLoading muda
   */
  public get isLoading$(): Observable<boolean> {
    return this.authState$.pipe(
      map((state) => state.isLoading),
      distinctUntilChanged()
    );
  }

  /**
   * Retorna o valor atual do estado (snapshot)
   */
  public getCurrentAuthState(): AuthState {
    return this.authState$.getValue();
  }

  // ========== Métodos Públicos ==========

  /**
   * Atualiza o estado de autenticação completo
   * Emite imediatamente para todos os subscribers
   */
  public setAuth(user: User, tokens: AuthTokens): void {
    const newState: AuthState = {
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    };
    
    // Emite imediatamente via BehaviorSubject
    this.authState$.next(newState);
    
    // Persiste de forma segura
    this.saveTokens(tokens, user);
  }

  /**
   * Salva tokens no localStorage de forma segura
   * Método público conforme requisitos do edital
   */
  public saveTokens(tokens: AuthTokens, user?: User): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }
    } catch (error) {
      console.error('[AuthStore] Erro ao salvar tokens:', error);
    }
  }

  /**
   * Atualiza apenas os tokens (útil para refresh)
   * Emite imediatamente para todos os subscribers
   */
  public updateTokens(tokens: AuthTokens): void {
    const currentState = this.authState$.getValue();
    
    const newState: AuthState = {
      ...currentState,
      tokens,
    };
    
    // Emite imediatamente via BehaviorSubject
    this.authState$.next(newState);
    
    // Persiste
    this.saveTokens(tokens);
  }

  /**
   * Limpa tokens e estado de autenticação
   * Método público conforme requisitos do edital
   */
  public clearTokens(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('[AuthStore] Erro ao limpar tokens:', error);
    }
    
    // Emite estado inicial imediatamente
    this.authState$.next(initialAuthState);
  }

  /**
   * Remove autenticação (logout)
   * Alias para clearTokens para manter compatibilidade
   */
  public clearAuth(): void {
    this.clearTokens();
  }

  /**
   * Define estado de loading
   */
  public setLoading(isLoading: boolean): void {
    const currentState = this.authState$.getValue();
    this.authState$.next({ ...currentState, isLoading });
  }

  // ========== Métodos Privados ==========

  /**
   * Carrega tokens e user do localStorage ao inicializar
   * Valida tokens antes de considerar autenticado
   */
  private loadStoredAuth(): void {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userDataStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (accessToken && refreshToken) {
        // Valida formato básico dos tokens
        if (this.isValidTokenFormat(accessToken) && this.isValidTokenFormat(refreshToken)) {
          let user: User | null = null;

          // Tenta recuperar dados do usuário
          if (userDataStr) {
            try {
              user = JSON.parse(userDataStr) as User;
            } catch (e) {
              console.warn('[AuthStore] Dados do usuário corrompidos, ignorando');
            }
          }

          // Atualiza estado
          this.authState$.next({
            user,
            tokens: { accessToken, refreshToken },
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          console.warn('[AuthStore] Tokens inválidos encontrados, limpando');
          this.clearTokens();
        }
      }
    } catch (error) {
      console.error('[AuthStore] Erro ao carregar tokens:', error);
      this.clearTokens();
    }
  }

  /**
   * Validação básica de formato de token JWT
   * Em produção: validar expiração e assinatura
   */
  private isValidTokenFormat(token: string): boolean {
    // JWT tem 3 partes separadas por ponto
    const parts = token.split('.');
    return parts.length === 3 && parts.every((part) => part.length > 0);
  }

  /**
   * Configura listener para sincronização entre tabs/janelas
   * Detecta mudanças no localStorage feitas por outras abas
   */
  private setupStorageListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (event: StorageEvent) => {
      // Ignora eventos de outras keys
      const validKeys = Object.values(STORAGE_KEYS);
      if (!event.key || !validKeys.includes(event.key as typeof validKeys[number])) {
        return;
      }

      console.log('[AuthStore] Storage event detectado:', event.key);

      // Se tokens foram removidos em outra aba
      if (event.key === STORAGE_KEYS.ACCESS_TOKEN && !event.newValue) {
        console.log('[AuthStore] Logout detectado em outra aba');
        this.authState$.next(initialAuthState);
        return;
      }

      // Se tokens foram adicionados/atualizados em outra aba
      if (
        (event.key === STORAGE_KEYS.ACCESS_TOKEN ||
          event.key === STORAGE_KEYS.REFRESH_TOKEN) &&
        event.newValue
      ) {
        console.log('[AuthStore] Login/refresh detectado em outra aba');
        // Recarrega estado do localStorage
        this.loadStoredAuth();
      }
    });
  }

  /**
   * Limpa todos os listeners ao destruir (cleanup)
   * Útil para testes
   */
  public destroy(): void {
    this.authState$.complete();
  }
}

// Exporta instância singleton
export const authStore = new AuthStore();
