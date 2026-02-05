import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { authService } from './auth.service';
import apiClient from './api';
import MockAdapter from 'axios-mock-adapter';
import type { AuthResponseDto, AuthRequestDto, User, LoginResponse } from '../types/auth.types';

describe('AuthService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
  });

  afterEach(() => {
    mock.reset();
  });

  describe('login', () => {
    it('should call login API and return transformed tokens', async () => {
      const credentials: AuthRequestDto = { username: 'admin', password: '123' };
      const apiResponse: AuthResponseDto = {
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        expires_in: 3600,
        refresh_expires_in: 7200
      };

      mock.onPost('/autenticacao/login').reply(200, apiResponse);

      const result: LoginResponse = await authService.login(credentials);

      expect(result.accessToken).toBe('fake-access-token');
      expect(result.refreshToken).toBe('fake-refresh-token');
    });

    it('should throw error on invalid credentials', async () => {
       const credentials: AuthRequestDto = { username: 'bad', password: 'bad' };
       mock.onPost('/autenticacao/login').reply(401);

      await expect(authService.login(credentials)).rejects.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user', async () => {
      const user: User = { id: 1, name: 'Admin', email: 'admin@test.com', cpf: '000', role: 'admin' };
      mock.onGet('/v1/auth/me').reply(200, user);

      const result = await authService.getCurrentUser();
      expect(result).toEqual(user);
    });
  });
});
