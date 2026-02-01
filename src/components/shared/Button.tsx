/**
 * Button - Componente de botão genérico e reutilizável
 * 
 * Suporta:
 * - Variantes (primary, secondary, danger, outline)
 * - Tamanhos (sm, md, lg)
 * - Ícones (left/right)
 * - Estados (loading, disabled)
 * - onClick ou navegação
 */

import type { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg disabled:bg-gray-400',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 disabled:bg-gray-100',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg disabled:bg-gray-400',
  outline: 'bg-transparent hover:bg-indigo-50 text-indigo-600 border border-indigo-600 disabled:border-gray-300 disabled:text-gray-400',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Carregando...
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
