import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';
import { authStore } from '../state/AuthStore';
import type { RefreshTokenResponse, RefreshTokenRequestDto } from '../types/auth.types';

/**
 * Cliente API configurado com Axios
 * Requisitos do Edital SEPLAG/MT - Nível Sênior
 * 
 * Features:
 * - BaseURL configurada para Pet Manager API
 * - Request Interceptor: adiciona JWT automaticamente a todas as requisições
 * - Response Interceptor: refresh automático e silencioso de token em 401
 * - Fila de requisições durante refresh para evitar race conditions
 * - Prevenção de loops infinitos no refresh
 * - Redirecionamento automático para /login em falhas críticas
 */
export const apiClient = axios.create({
  baseURL: 'https://pet-manager-api.geia.vip',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interface para itens da fila de requisições pendentes
 */
interface QueuedRequest {
  resolve: (value: string | null) => void;
  reject: (reason: AxiosError) => void;
}

// Flag para controle de refresh em progresso
let isRefreshing = false;

// Fila de requisições que falharam com 401 durante o refresh
let failedQueue: QueuedRequest[] = [];

/**
 * Log centralizado de erros da API
 * Em produção, integrar com Sentry, DataDog, etc.
 */
const logApiError = (error: AxiosError, context: string): void => {
  console.error(`[API Error - ${context}]`, {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    url: error.config?.url,
    method: error.config?.method,
  });
};

/**
 * Processa a fila de requisições que falharam durante o refresh
 * @param error - Erro a ser propagado para todas as requisições na fila (se houver)
 * @param token - Novo access token para ser usado nas requisições (se sucesso)
 */
const processQueue = (error: AxiosError | null, token: string | null = null): void => {
  failedQueue.forEach((queuedRequest: QueuedRequest) => {
    if (error) {
      queuedRequest.reject(error);
    } else {
      queuedRequest.resolve(token);
    }
  });

  // Limpa a fila após processar
  failedQueue = [];
};

/**
 * Redireciona para página de login
 * Usado quando autenticação falha de forma irrecuperável
 */
const redirectToLogin = (): void => {
  // Verifica se está em ambiente browser
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

/**
 * Request Interceptor
 * 
 * Intercepta todas as requisições HTTP para:
 * 1. Obter o access_token do AuthStore (RxJS BehaviorSubject)
 * 2. Anexar o token como Bearer token no header Authorization
 * 
 * Este interceptor é executado ANTES de cada requisição ser enviada.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Obtém snapshot do estado de autenticação do BehaviorSubject
    const authState = authStore.getCurrentAuthState();
    const token = authState.tokens?.accessToken;

    // Adiciona Bearer token se existir
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError): Promise<never> => {
    return Promise.reject(error);
  }
);

/**
 * Interface estendida para rastrear tentativas de retry
 */
interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Response Interceptor - Silent Refresh Token Logic
 * 
 * Intercepta respostas HTTP para:
 * 1. Detectar erros 401 Unauthorized
 * 2. Tentar refresh automático usando POST /v1/auth/refresh
 * 3. Gerenciar fila de requisições durante refresh (previne race conditions)
 * 4. Redirecionar para /login se refresh falhar
 * 5. Prevenir loops infinitos se o próprio endpoint de refresh retornar 401
 */
apiClient.interceptors.response.use(
  (response) => {
    // Resposta bem-sucedida, passa adiante
    return response;
  },
  async (error: AxiosError): Promise<unknown> => {
    const originalRequest = error.config as RetryableAxiosRequestConfig;

    // Verifica se é erro 401 Unauthorized
    const is401Error = error.response?.status === 401;

    // CRÍTICO: Previne loop infinito - não tenta refresh se a própria URL de refresh falhou
    const isRefreshEndpoint = originalRequest?.url?.includes('/autenticacao/refresh');

    // Verifica se já tentou fazer retry desta requisição
    const hasAlreadyRetried = originalRequest?._retry === true;

    if (is401Error && !hasAlreadyRetried && !isRefreshEndpoint) {
      // === CENÁRIO 1: Refresh já está em progresso ===
      if (isRefreshing) {
        // Adiciona requisição à fila para ser reprocessada após refresh
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken: string | null) => {
            // Refresh completou com sucesso, atualiza header e refaz requisição
            if (originalRequest.headers && newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err: AxiosError) => {
            // Refresh falhou, propaga erro
            return Promise.reject(err);
          });
      }

      // === CENÁRIO 2: Inicia processo de refresh ===

      // Marca requisição como retry para não tentar novamente
      originalRequest._retry = true;

      // Ativa flag de refresh em progresso
      isRefreshing = true;

      // Obtém refresh token do AuthStore
      const authState = authStore.getCurrentAuthState();
      const refreshToken = authState.tokens?.refreshToken;

      // Verifica se há refresh token disponível
      if (!refreshToken) {
        logApiError(error, 'No refresh token available - redirecting to login');

        // Limpa autenticação
        authStore.clearAuth();

        // Rejeita todas as requisições na fila
        processQueue(error, null);

        // Reseta flag
        isRefreshing = false;

        // Redireciona para login
        redirectToLogin();

        return Promise.reject(error);
      }

      try {
        // === Tenta fazer refresh do token ===

        // Monta payload conforme OpenAPI
        const refreshPayload: RefreshTokenRequestDto = {
          refresh_token: refreshToken,
        };

        // Faz requisição de refresh usando axios diretamente (não apiClient)
        // para evitar que passe pelos interceptors
        const response = await axios.post<RefreshTokenResponse>(
          'https://pet-manager-api.geia.vip/autenticacao/refresh',
          refreshPayload,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          }
        );

        // Mapeia resposta da API (snake_case) para uso interno
        const accessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        // Atualiza tokens no AuthStore (BehaviorSubject)
        authStore.updateTokens({
          accessToken,
          refreshToken: newRefreshToken,
        });

        // Processa todas as requisições na fila com novo token
        processQueue(null, accessToken);

        // Atualiza header da requisição original
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Reseta flag
        isRefreshing = false;

        // Refaz a requisição original com novo token
        return apiClient(originalRequest);

      } catch (refreshError) {
        // === Refresh falhou (401/403 ou erro de rede) ===

        const axiosError = refreshError as AxiosError;

        logApiError(axiosError, 'Token refresh failed - redirecting to login');

        // Rejeita todas as requisições na fila
        processQueue(axiosError, null);

        // Limpa autenticação
        authStore.clearAuth();

        // Reseta flag
        isRefreshing = false;

        // Redireciona para login
        redirectToLogin();

        return Promise.reject(refreshError);
      }
    }

    // Se chegou aqui, é um erro que não é 401 ou já foi tratado
    // Log apenas se for um erro de resposta da API
    if (error.response && error.response.status !== 401) {
      logApiError(error, 'API Response Error');

      // === GLOBAL ERROR TOAST ===
      // Mostra toast automaticamente para erros de servidor ou bad request
      const status = error.response.status;
      const message = (error.response.data as { message?: string })?.message || 'Ocorreu um erro inesperado';

      if (status >= 500) {
        toast.error(`Erro do Servidor: ${message}`);
      } else if (status >= 400 && status !== 404) {
        // 404 geralmente é tratado localmente (ex: tela vazia), mas 400/403 merecem aviso
        toast.error(message);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
