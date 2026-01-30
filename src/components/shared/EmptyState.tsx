/**
 * EmptyState - Componente genérico para estados vazios
 * 
 * Features:
 * - Ícone customizável
 * - Título e descrição
 * - Botão de ação opcional
 * - Layout consistente
 */

import type { ReactNode } from 'react';
import { stateStyles } from '../../styles/theme';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Ícone padrão para empty state
 */
const DefaultEmptyIcon = () => (
  <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className={stateStyles.empty}>
      {icon || <DefaultEmptyIcon />}
      
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-500 mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};
