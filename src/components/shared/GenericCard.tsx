/**
 * GenericCard - Componente de card polimórfico e reutilizável
 * 
 * Features:
 * - Altura consistente (h-full) para grid perfeito
 * - Truncamento automático de texto longo (line-clamp-2 no título, truncate no resto)
 * - Tooltip no hover para ver texto completo
 * - Imagem com aspect ratio fixo (h-48)
 * - Botões sempre alinhados no bottom do card
 * - Suporta ícone fallback quando sem imagem
 * 
 * Uso:
 * - Pets: title={nome}, subtitle={raca}, description={idade}
 * - Tutors: title={nome}, subtitle={email}, description={telefone}
 */

import { toast } from 'react-hot-toast';

interface GenericCardProps {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string | null;
  icon?: React.ReactNode;
  onViewDetails?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  additionalInfo?: React.ReactNode;
}

export const GenericCard = ({
  id,
  title,
  subtitle,
  description,
  imageUrl,
  icon,
  onViewDetails,
  onEdit,
  onDelete,
  additionalInfo,
}: GenericCardProps) => {

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Previne navegação ao clicar em excluir
    if (!onDelete) return;

    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-medium text-gray-800">
          Tem certeza que deseja excluir <b>{title}</b>?
        </p>
        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onDelete(id);
              toast.dismiss(t.id);
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    ), {
      duration: 5000,
      icon: '⚠️',
      style: {
        minWidth: '300px',
      },
    });
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Previne navegação
    onEdit?.(id);
  };

  // Helper para obter iniciais
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleCardClick = () => {
    onViewDetails?.(id);
  };


  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col h-full cursor-pointer relative"
      onClick={handleCardClick}
    >
      {/* Image or Icon - Aspect Square or 4/3 */}
      <div className="relative aspect-[4/3] flex-shrink-0 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        {!imageUrl && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <span className="text-white font-bold text-xl tracking-wider">
              {getInitials(title) || icon || '🐾'}
            </span>
          </div>
        )}

        {/* Floating Actions (Top Right) - Visible on Mobile (Standard) / Hover on Desktop */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 z-10">
          {onEdit && (
            <button
              onClick={handleEditClick}
              className="p-3 lg:p-2 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-indigo-600 rounded-full shadow-sm hover:shadow-md transition-all min-w-[44px] min-h-[44px] lg:min-w-0 lg:min-h-0 flex items-center justify-center"
              title="Editar"
            >
              <svg className="w-5 h-5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="p-3 lg:p-2 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-red-600 rounded-full shadow-sm hover:shadow-md transition-all min-w-[44px] min-h-[44px] lg:min-w-0 lg:min-h-0 flex items-center justify-center"
              title="Excluir"
            >
              <svg className="w-5 h-5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col items-center text-center flex-1">
        {/* Title (Nome) */}
        <h3
          className="text-lg font-bold text-gray-900 mb-2 w-full truncate capitalize"
          title={title}
        >
          {title}
        </h3>

        {/* Badges Container */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3 w-full">
          {/* Subtitle Badge (Raça/Email) */}
          {subtitle && (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize max-w-full truncate"
              title={subtitle}
            >
              {subtitle}
            </span>
          )}

          {/* Description Badge (Idade/Telefone) */}
          {description && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 max-w-full truncate">
              {description}
            </span>
          )}
        </div>

        {/* Additional Info */}
        {additionalInfo && (
          <div className="w-full mb-2 overflow-hidden text-xs text-gray-400">
            {additionalInfo}
          </div>
        )}
        
        {/* Spacer */}
        <div className="flex-1" />
      </div>
    </div>
  );
};
