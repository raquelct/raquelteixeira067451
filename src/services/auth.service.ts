import apiClient from './api';
import type { 
  AuthRequestDto, 
  AuthResponseDto,
  User, 
  AuthTokens, 
  LoginResponse} from '../types/auth.types';


const AUTH_BASE_URL = 'https://pet-manager-api.geia.vip';
export class AuthService {
  async login(credentials: AuthRequestDto): Promise<LoginResponse> {
    const { data } = await apiClient.post<AuthResponseDto>(
      '/autenticacao/login',
      credentials
    );

    return this.transformAuthResponse(data);
  }

  async logout(): Promise<void> {
    return Promise.resolve();
  }

  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>('/v1/auth/me');
    return data;
  }

  
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.put<AuthResponseDto>(
      `${AUTH_BASE_URL}/autenticacao/refresh`,
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      }
    );
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token
    };
  }

  private transformAuthResponse(dto: AuthResponseDto): LoginResponse {
    return {
      accessToken: dto.access_token,
      refreshToken: dto.refresh_token,
      expiresIn: dto.expires_in,
      refreshExpiresIn: dto.refresh_expires_in,
    };
  }
}

export const authService = new AuthService();
