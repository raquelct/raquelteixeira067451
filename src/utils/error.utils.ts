export class AppError extends Error {
  public readonly code?: string;
  public readonly statusCode?: number;

  constructor(
    message: string,
    code?: string,
    statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const formatErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { status: number; data?: { message?: string } } };
    const status = axiosError.response?.status;
    const message = axiosError.response?.data?.message || defaultMessage;

    if (status === 404) return `${message} (Não encontrado)`;
    if (status === 403) return `${message} (Acesso negado)`;

    return message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
};
