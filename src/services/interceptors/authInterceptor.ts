import { 
  AxiosError, 
  type AxiosInstance, 
  type InternalAxiosRequestConfig, 
  type AxiosRequestConfig,
  type AxiosResponse
} from 'axios';
import { authStore } from '../../state/AuthStore';


const REFRESH_ENDPOINT = '/autenticacao/refresh';
const LOGIN_ROUTE = '/login';

interface RetryableConfig extends AxiosRequestConfig {
  _retry?: boolean;
}


const refreshQueue = {
  isRefreshing: false,
  failedQueue: [] as Array<{
    resolve: (token: string) => void;
    reject: (error: AxiosError) => void;
  }>,

  add(request: { resolve: (token: string) => void; reject: (error: AxiosError) => void }) {
    this.failedQueue.push(request);
  },

  process(error: AxiosError | null, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token!);
      }
    });
    this.failedQueue = [];
  }
};

const handleRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const authState = authStore.getCurrentAuthState();
  const token = authState.tokens?.accessToken;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const handleResponseError = async (error: AxiosError, axiosInstance: AxiosInstance): Promise<any> => {
  const originalRequest = error.config as RetryableConfig;

  if (error.response?.status !== 401 || originalRequest._retry) {
    return Promise.reject(error);
  }

  if (originalRequest.url?.includes(REFRESH_ENDPOINT)) {
    handleLogout();
    return Promise.reject(error);
  }

  if (refreshQueue.isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      refreshQueue.add({ resolve, reject });
    })
      .then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return axiosInstance(originalRequest);
      })
      .catch((err) => Promise.reject(err));
  }

  originalRequest._retry = true;
  refreshQueue.isRefreshing = true;

  try {
    const refreshToken = authStore.getCurrentAuthState().tokens?.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const { authService } = await import('../../services/auth.service');
    const newTokens = await authService.refreshTokens(refreshToken);

    authStore.updateTokens(newTokens);
    refreshQueue.process(null, newTokens.accessToken);

    if (originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
    }
    
    return axiosInstance(originalRequest);

  } catch (refreshError) {
    refreshQueue.process(refreshError as AxiosError, null);
    handleLogout();
    return Promise.reject(refreshError);
  } finally {
    refreshQueue.isRefreshing = false;
  }
};

const handleLogout = () => {
  authStore.clearAuth();
  if (typeof window !== 'undefined') {
    window.location.href = LOGIN_ROUTE;
  }
};

export const setupAuthInterceptors = (axiosInstance: AxiosInstance): void => {
  axiosInstance.interceptors.request.use(
    handleRequest,
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => handleResponseError(error, axiosInstance)
  );
};