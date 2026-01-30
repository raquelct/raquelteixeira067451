/**
 * Tipos relacionados à autenticação
 * Conforme requisitos do edital SEPLAG/MT e OpenAPI da Pet Manager API
 */

// === DTOs da API (conforme OpenAPI) ===

/**
 * AuthRequestDto - Payload de login
 * POST /autenticacao/login
 */
export interface AuthRequestDto {
  username: string;
  password: string;
}

/**
 * AuthResponseDto - Resposta de login
 * POST /autenticacao/login
 */
export interface AuthResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
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
 */
export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
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
