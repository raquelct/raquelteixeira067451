import apiClient from '../api/axiosInstance';
import type { LoginCredentials, User, AuthTokens } from '../types/auth.types';

/**
 * AuthService - Serviço de Autenticação
 * Implementa as chamadas à API conforme OpenAPI
 * Endpoints base: /v1/auth/*
 */

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Realiza login do usuário
   * POST /v1/auth/login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/v1/auth/login', credentials);
    return response.data;
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
