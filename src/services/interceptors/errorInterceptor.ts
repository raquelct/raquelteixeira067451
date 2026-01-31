import { AxiosError, type AxiosInstance } from 'axios';
import { toast } from 'react-hot-toast';

/**
 * Log centralizado de erros da API
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
 * Configura o interceptor de Tratamento de Erros Globais (Feedback Visual)
 */
export const setupErrorInterceptor = (axiosInstance: AxiosInstance): void => {
    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            // Tratamento de Erro de Conexão
            if (!error.response) {
                logApiError(error, 'Network Error');
                toast.error('Falha de conexão. Verifique sua internet.', { id: 'network-error' });
                return Promise.reject(error);
            }

            const status = error.response.status;
            const message = (error.response.data as { message?: string })?.message || 'Ocorreu um erro inesperado';

            logApiError(error, `API Error ${status}`);

            // 401 is handled functionally by AuthInterceptor (redirect/clear).
            // Here we mostly care about showing the toast IF it Bubbles up (meaning refresh failed).
            switch (status) {
                case 400:
                    // Bad Request: exibe mensagem da API
                    toast.error(message, { id: message });
                    break;
                case 401:
                    // Se chegou aqui, é porque o AuthInterceptor já desistiu (refresh falhou ou impossível)
                    // O AuthInterceptor já fez redirect, só mostramos a mensagem.
                    toast.error('Sessão expirada. Faça login novamente.', { id: 'session-expired' });
                    break;
                case 403:
                    // Forbidden
                    toast.error('Acesso negado: Você não tem permissão para realizar esta ação.', { id: 'forbidden-error' });
                    break;
                case 404:
                    // Not Found
                    toast.error('Recurso não encontrado.', { id: 'not-found-error' });
                    break;
                case 500:
                case 502:
                case 503:
                case 504:
                    // Server Errors
                    toast.error('Erro interno do servidor. Tente novamente mais tarde.', { id: 'server-error' });
                    break;
                default:
                    toast.error(`Erro inesperado (${status}): ${message}`, { id: `error-${status}` });
                    break;
            }

            return Promise.reject(error);
        }
    );
};
