/**
 * ErrorState - Componente genérico para estados de erro
 * 
 * Features:
 * - Mensagem de erro customizável
 * - Botão de retry opcional
 * - Layout consistente
 * - Alto contraste
 */

import type { ReactNode } from 'react';
import { Button } from './Button';
import { stateStyles } from '../../styles/theme';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
}

export const ErrorState = ({
  title = 'Erro ao carregar dados',
  message,
  onRetry,
  retryLabel = 'Tentar Novamente',
  action,
}: ErrorStateProps) => {
  return (
    <div className={stateStyles.error}>
      <div className="flex items-start">
        <svg className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <h3 className="font-semibold text-red-800">{title}</h3>
          <p className="text-sm text-red-600 mt-1">{message}</p>
        </div>
      </div>
      
      {onRetry && (
        <Button
          variant="danger"
          onClick={onRetry}
          className="mt-4"
        >
          {retryLabel}
        </Button>
      )}
      
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};
