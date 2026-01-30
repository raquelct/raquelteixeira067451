import apiClient from '../api/axiosInstance';
import type { AuthRequestDto, AuthResponseDto, User, AuthTokens } from '../types/auth.types';

/**
 * AuthService - Serviço de Autenticação
 * Implementa as chamadas à API conforme OpenAPI Real
 */

/**
 * Response interna do login (mapeada de AuthResponseDto)
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

export class AuthService {
  /**
   * Realiza login do usuário
   * POST /autenticacao/login
   */
  async login(credentials: AuthRequestDto): Promise<LoginResponse> {
    const response = await apiClient.post<AuthResponseDto>(
      '/autenticacao/login',
      credentials
    );

    // Mapeia snake_case da API para camelCase interno
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      refreshExpiresIn: response.data.refresh_expires_in,
    };
  }

  /**
   * Realiza logout do usuário
   * POST /v1/auth/logout
   */
  async logout(): Promise<void> {
    await apiClient.post('/v1/auth/logout');
  }

  /**
   * Obtém informações do usuário atual
   * GET /v1/auth/me
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/v1/auth/me');
    return response.data;
  }

  /**
   * Renova tokens de autenticação
   * POST /v1/auth/refresh
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>('/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  }
}

// Exporta instância singleton
export const authService = new AuthService();
