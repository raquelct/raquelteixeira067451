import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import type { AuthState, User, AuthTokens } from '../types/auth.types';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'pet_registry_access_token',
  REFRESH_TOKEN: 'pet_registry_refresh_token',
  USER_DATA: 'pet_registry_user_data',
} as const;

const initialAuthState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
};


class AuthStore {
  private authState$: BehaviorSubject<AuthState>;

  constructor() {
    this.authState$ = new BehaviorSubject<AuthState>(initialAuthState);
    this.loadStoredAuth();
    this.setupStorageListener();
  }

  public getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  public get isAuthenticated$(): Observable<boolean> {
    return this.authState$.pipe(
      map((state) => state.isAuthenticated),
      distinctUntilChanged()
    );
  }

  public get user$(): Observable<User | null> {
    return this.authState$.pipe(
      map((state) => state.user),
      distinctUntilChanged()
    );
  }

  public get tokens$(): Observable<AuthTokens | null> {
    return this.authState$.pipe(
      map((state) => state.tokens),
      distinctUntilChanged()
    );
  }

  public get isLoading$(): Observable<boolean> {
    return this.authState$.pipe(
      map((state) => state.isLoading),
      distinctUntilChanged()
    );
  }

  public getCurrentAuthState(): AuthState {
    return this.authState$.getValue();
  }

  public setAuth(user: User, tokens: AuthTokens): void {
    const newState: AuthState = {
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    };
    this.authState$.next(newState);

    this.saveTokens(tokens, user);
  }

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

  public updateTokens(tokens: AuthTokens): void {
    const currentState = this.authState$.getValue();

    const newState: AuthState = {
      ...currentState,
      tokens,
    };
    this.authState$.next(newState);
    this.saveTokens(tokens);
  }

  public clearTokens(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('[AuthStore] Erro ao limpar tokens:', error);
    }

    this.authState$.next(initialAuthState);
  }

  public clearAuth(): void {
    this.clearTokens();
  }

  public setLoading(isLoading: boolean): void {
    const currentState = this.authState$.getValue();
    this.authState$.next({ ...currentState, isLoading });
  }

  private loadStoredAuth(): void {
    try {
      const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userDataStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (accessToken && refreshToken) {
        if (this.isValidTokenFormat(accessToken) && this.isValidTokenFormat(refreshToken)) {
          let user: User | null = null;

          if (userDataStr) {
            try {
              user = JSON.parse(userDataStr) as User;
            } catch (_e) {
            }
          }

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

      // Se tokens foram removidos em outra aba
      if (event.key === STORAGE_KEYS.ACCESS_TOKEN && !event.newValue) {
        this.authState$.next(initialAuthState);
        return;
      }

      // Se tokens foram adicionados/atualizados em outra aba
      if (
        (event.key === STORAGE_KEYS.ACCESS_TOKEN ||
          event.key === STORAGE_KEYS.REFRESH_TOKEN) &&
        event.newValue
      ) {
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
