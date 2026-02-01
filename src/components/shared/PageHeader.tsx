/**
 * PageHeader - Componente de cabeçalho genérico para páginas de listagem
 * 
 * Features:
 * - Título e subtítulo
 * - Botão de ação principal (ex: "Novo Pet", "Novo Tutor")
 * - Navegação ou callback customizado
 * - Layout responsivo
 */

import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { textStyles } from '../../styles/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  navigateTo?: string;
  onButtonClick?: () => void;
  icon?: string;
  showButton?: boolean;
}

/**
 * Ícone de "Plus" SVG
 */
const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

export const PageHeader = ({
  title,
  subtitle,
  buttonLabel,
  navigateTo,
  onButtonClick,
  icon,
  showButton = true,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <div className="mb-8 sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-7xl mx-auto">
        {/* Título e Subtítulo */}
        <div>
          <h1 className={textStyles.title}>
            {icon && <span className="mr-2">{icon}</span>}
            {title}
          </h1>
          {subtitle && (
            <p className={textStyles.subtitle}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Botão de Ação */}
        {showButton && buttonLabel && (
          <Button
            variant="primary"
            leftIcon={<PlusIcon />}
            onClick={handleButtonClick}
          >
            {buttonLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
