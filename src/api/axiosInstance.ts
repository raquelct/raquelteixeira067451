import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { authStore } from '../state/AuthStore';
import type { RefreshTokenResponse } from '../types/auth.types';

// Cria instância do Axios
export const apiClient = axios.create({
  baseURL: 'https://pet-manager-api.geia.vip',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para evitar loop infinito no refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Processa a fila de requisições que falharam durante o refresh
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Request Interceptor - Adiciona JWT Bearer Token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authState = authStore.getCurrentAuthState();
    const token = authState.tokens?.accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Se o erro for 401 e não for uma tentativa de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Se já está refreshing, adiciona à fila
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const authState = authStore.getCurrentAuthState();
      const refreshToken = authState.tokens?.refreshToken;

      if (!refreshToken) {
        // Sem refresh token, desloga o usuário
        authStore.clearAuth();
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Tenta fazer refresh do token
        const response = await axios.post<RefreshTokenResponse>(
          'https://pet-manager-api.geia.vip/auth/refresh',
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Atualiza tokens no store
        authStore.updateTokens({
          accessToken,
          refreshToken: newRefreshToken,
        });

        // Processa fila de requisições
        processQueue(null, accessToken);

        // Refaz a requisição original com novo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Falha no refresh, desloga o usuário
        processQueue(refreshError as AxiosError, null);
        authStore.clearAuth();
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
