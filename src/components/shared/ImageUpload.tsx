import React from 'react';

interface ImageUploadProps {
    label: string;
    previewUrl: string | null;
    /**
     * Função chamada quando um arquivo é selecionado
     */
    onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /**
     * Função chamada para remover a imagem
     */
    onRemove: () => void;
    id?: string;
}

/**
 * ImageUpload - Componente visual para seleção e preview de imagens
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
    label,
    previewUrl,
    onImageSelect,
    onRemove,
    id = 'image-upload',
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>

            {!previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors bg-gray-50 hover:bg-white">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onImageSelect}
                        className="hidden"
                        id={id}
                    />
                    <label
                        htmlFor={id}
                        className="cursor-pointer flex flex-col items-center"
                    >
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span className="text-sm text-gray-600 mb-1">
                            Clique para selecionar uma imagem
                        </span>
                        <span className="text-xs text-gray-500">PNG, JPG até 5MB</span>
                    </label>
                </div>
            ) : (
                <div className="relative group">
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
                    <button
                        type="button"
                        onClick={onRemove}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors shadow-md transform hover:scale-105"
                        aria-label="Remover imagem"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};
