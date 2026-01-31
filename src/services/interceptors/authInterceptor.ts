import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig, type AxiosRequestConfig } from 'axios';
import { authStore } from '../../state/AuthStore';
import type { RefreshTokenResponse, RefreshTokenRequestDto } from '../../types/auth.types';

interface QueuedRequest {
    resolve: (value: string | null) => void;
    reject: (reason: AxiosError) => void;
}

interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null): void => {
    failedQueue.forEach((queuedRequest: QueuedRequest) => {
        if (error) {
            queuedRequest.reject(error);
        } else {
            queuedRequest.resolve(token);
        }
    });
    failedQueue = [];
};

const redirectToLogin = (): void => {
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
};

/**
 * Configura os interceptors de Autenticação (Request + Refresh Token)
 */
export const setupAuthInterceptors = (axiosInstance: AxiosInstance): void => {
    // === Request Interceptor: Inject Token ===
    axiosInstance.interceptors.request.use(
        (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
            const authState = authStore.getCurrentAuthState();
            const token = authState.tokens?.accessToken;

            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error: AxiosError): Promise<never> => {
            return Promise.reject(error);
        }
    );

    // === Response Interceptor: Refresh Token Logic ===
    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as RetryableAxiosRequestConfig;
            const is401Error = error.response?.status === 401;
            const isRefreshEndpoint = originalRequest?.url?.includes('/autenticacao/refresh');
            const hasAlreadyRetried = originalRequest?._retry === true;

            // Se não for 401 ou for o próprio refresh falhando, repassa o erro para o próximo interceptor (ErrorInterceptor)
            if (!is401Error || isRefreshEndpoint || hasAlreadyRetried) {
                // Se falhou o refresh ou retry, limpa auth e redireciona
                if (is401Error && (isRefreshEndpoint || hasAlreadyRetried)) {
                    authStore.clearAuth();
                    redirectToLogin();
                    // Rejecting here will pass to ErrorInterceptor, which might show "Session Expired" if we want, 
                    // but traditionally we might handle the toast there or here. 
                    // User asked to move logic here. We can reject and let ErrorInterceptor toast, OR toast here and returning rejected.
                    // However, if we toast here, ErrorInterceptor might also toast.
                    // Ideally, AuthInterceptor handles the *Action* of refreshing.
                    // If it fails final, it rejects.
                }
                return Promise.reject(error);
            }

            // === Start Refresh Logic ===
            if (isRefreshing) {
                return new Promise<string | null>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((newToken: string | null) => {
                        if (originalRequest.headers && newToken) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        return axiosInstance(originalRequest);
                    })
                    .catch((err: AxiosError) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const authState = authStore.getCurrentAuthState();
            const refreshToken = authState.tokens?.refreshToken;

            if (!refreshToken) {
                authStore.clearAuth();
                processQueue(error, null);
                isRefreshing = false;
                redirectToLogin();
                // Return rejection. ErrorInterceptor will catch it.
                return Promise.reject(error);
            }

            try {
                const refreshPayload: RefreshTokenRequestDto = { refresh_token: refreshToken };
                const response = await axios.post<RefreshTokenResponse>(
                    'https://pet-manager-api.geia.vip/autenticacao/refresh',
                    refreshPayload,
                    { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
                );

                const accessToken = response.data.access_token;
                const newRefreshToken = response.data.refresh_token;

                authStore.updateTokens({ accessToken, refreshToken: newRefreshToken });
                processQueue(null, accessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }

                isRefreshing = false;
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                const axiosError = refreshError as AxiosError;
                processQueue(axiosError, null);
                authStore.clearAuth();
                isRefreshing = false;
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }
    );
};
