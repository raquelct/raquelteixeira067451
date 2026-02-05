interface GenericCardProps {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string | null;
  icon?: React.ReactNode;
  descriptionIcon?: React.ReactNode;
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
  descriptionIcon,
  onViewDetails,
  onEdit,
  onDelete,
  additionalInfo,
}: GenericCardProps) => {

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!onDelete) return;
    onDelete(id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(id);
  };

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
      <div className="relative aspect-[4/3] flex-shrink-0 bg-gray-50 overflow-hidden">
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
              {getInitials(title) || icon  }
            </span>
          </div>
        )}

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
      <div className="p-4 flex flex-col items-center text-center flex-1">
        <h3
          className="text-lg font-bold text-gray-900 mb-2 w-full truncate capitalize"
          title={title}
        >
          {title}
        </h3>

        {subtitle && (
          <p className="text-sm text-gray-600 mb-2 w-full truncate capitalize" title={subtitle}>
            {subtitle}
          </p>
        )}

        {description && (
          <div className="flex items-center justify-center gap-1.5 text-sm text-gray-500 mb-2 w-full">
            {descriptionIcon && (
              <span className="flex-shrink-0" aria-hidden="true">
                {descriptionIcon}
              </span>
            )}
            <span className="truncate">{description}</span>
          </div>
        )}
        {additionalInfo && (
          <div className="w-full mb-2 overflow-hidden text-xs text-gray-400">
            {additionalInfo}
          </div>
        )}
        <div className="flex-1" />
      </div>
    </div>
  );
};
