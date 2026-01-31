import React from 'react';

/**
 * LoadingSpinner - Componente visual de carregamento
 * Centralizado e estilizado com Tailwind CSS
 */
export const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-[50vh] w-full">
            <div className="relative">
                {/* Outer Ring */}
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>

                {/* Inner Dot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};
