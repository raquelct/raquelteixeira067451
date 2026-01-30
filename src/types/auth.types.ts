/**
 * Tipos relacionados à autenticação
 * Conforme requisitos do edital SEPLAG/MT e OpenAPI da Pet Manager API
 */

// === DTOs da API (conforme OpenAPI) ===

/**
 * AuthRequestDto - Payload de login
 * POST /v1/auth/login
 */
export interface AuthRequestDto {
  email: string;
  password: string;
}

/**
 * AuthResponseDto - Resposta de login
 * POST /v1/auth/login
 */
export interface AuthResponseDto {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * RefreshTokenRequestDto - Payload de refresh
 * POST /v1/auth/refresh
 */
export interface RefreshTokenRequestDto {
  refresh_token: string;
}

/**
 * RefreshTokenResponse - Resposta de refresh
 * POST /v1/auth/refresh
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// === Tipos do domínio ===

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: 'admin' | 'user';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Alias para manter compatibilidade
export type LoginCredentials = AuthRequestDto;
