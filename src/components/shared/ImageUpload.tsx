import { X } from 'lucide-react';
import uploadIcon from '../../assets/icons/upload.svg';

interface ImageUploadProps {
    label: string;
    previewUrl: string | null;
    onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    id?: string;
}

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
                        <img src={uploadIcon} alt="" className="w-12 h-12 mb-3 opacity-60" />
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
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};
