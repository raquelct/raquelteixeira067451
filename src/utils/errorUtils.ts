import { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown, defaultMsg: string = 'Ocorreu um erro inesperado.'): string => {
  if (error instanceof AxiosError) {
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return 'Erro de conexão. Verifique sua internet.';
    }

    const data = error.response.data as { message?: string; error?: string; detail?: string };
    
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (data?.detail) return data.detail;

    if (error.response.statusText) {
      return `Erro ${error.response.status}: ${error.response.statusText}`; 
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }

  return defaultMsg;
};
