/**
 * GenericCard - Componente de card polimórfico e reutilizável
 * 
 * Uso:
 * - Pets: title={nome}, subtitle={raca}, description={idade}
 * - Tutors: title={nome}, subtitle={email}, description={telefone}
 */

interface GenericCardProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string | null;
  icon?: React.ReactNode;
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
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
  additionalInfo,
}: GenericCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      {/* Image or Icon */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 overflow-hidden">
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

      {/* Content - Centralizado */}
      <div className="p-6 flex flex-col items-center text-center">
        {/* Title (Nome) */}
        <h3 className="text-xl font-bold text-gray-900 mb-2" title={title}>
          {title}
        </h3>

        {/* Subtitle (Raça/Email) */}
        {subtitle && (
          <p className="text-sm text-gray-600 mb-2">
            {subtitle}
          </p>
        )}

        {/* Description (Idade/Telefone) */}
        {description && (
          <p className="text-sm text-gray-500 mb-4">
            {description}
          </p>
        )}

        {/* Additional Info (CPF, Endereço, etc) */}
        {additionalInfo && (
          <div className="w-full mb-4">
            {additionalInfo}
          </div>
        )}

        {/* Action Buttons */}
        {(onViewDetails || onEdit) && (
          <div className="w-full flex gap-2 mt-4">
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
          </div>
        )}
      </div>
    </div>
  );
};
