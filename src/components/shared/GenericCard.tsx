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
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group flex flex-col h-full">
      {/* Image or Icon - Fixed Height */}
      <div className="relative h-48 flex-shrink-0 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        {!imageUrl && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">
              {icon || '🐾'}
            </span>
          </div>
        )}
      </div>

      {/* Content - Grows to fill space, pushes buttons down */}
      <div className="p-6 flex flex-col items-center text-center flex-1">
        {/* Title (Nome) - Max 2 lines with ellipsis */}
        <h3 
          className="text-xl font-bold text-gray-900 mb-2 w-full line-clamp-2" 
          title={title}
        >
          {title}
        </h3>

        {/* Subtitle (Raça/Email) - Single line with ellipsis */}
        {subtitle && (
          <p 
            className="text-sm text-gray-600 mb-2 w-full truncate" 
            title={subtitle}
          >
            {subtitle}
          </p>
        )}

        {/* Description (Idade/Telefone) - Single line */}
        {description && (
          <p className="text-sm text-gray-500 mb-2 w-full truncate">
            {description}
          </p>
        )}

        {/* Additional Info (CPF, Endereço, etc) - Limited height */}
        {additionalInfo && (
          <div className="w-full mb-2 overflow-hidden">
            {additionalInfo}
          </div>
        )}

        {/* Spacer - Pushes buttons to bottom */}
        <div className="flex-1 min-h-[0.5rem]" />

        {/* Action Buttons - Always at bottom */}
        {(onViewDetails || onEdit || onDelete) && (
          <div className="w-full flex gap-2 mt-auto">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(id)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                aria-label="Ver detalhes"
              >
                Ver Detalhes
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(id)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 group"
                aria-label="Editar"
                title="Editar"
              >
                <svg 
                  className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(id)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200 group"
                aria-label="Excluir"
                title="Excluir"
              >
                <svg
                  className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
