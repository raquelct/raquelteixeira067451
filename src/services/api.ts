import axios from 'axios';
import { setupAuthInterceptors } from './interceptors/authInterceptor';
import { setupErrorInterceptor } from './interceptors/errorInterceptor';

/**
 * Cliente API configurado com Axios
 * Requisitos do Edital SEPLAG/MT - Nível Sênior
 * 
 * Features:
 * - BaseURL configurada para Pet Manager API
 * - Auth Interceptor: Gerencia Token Injection e Refresh Token (Silent)
 * - Error Interceptor: Gerencia Feedback Visual (Toasts)
 */
export const apiClient = axios.create({
  baseURL: 'https://pet-manager-api.geia.vip',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup Interceptors (Ordem Importa!)
// 1. Auth: Tenta recuperar o token/sessão antes de qualquer erro
setupAuthInterceptors(apiClient);

// 2. Error: Se a Auth falhar ou for outro erro, exibe feedback visual
setupErrorInterceptor(apiClient);

export default apiClient;

