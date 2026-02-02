import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface UseImageUploadOptions {
  maxSizeMB?: number;
  onError?: (message: string) => void;
}

interface UseImageUploadReturn {
  imageFile: File | null;
  imagePreview: string | null;
  isImageRemoved: boolean;
  currentPhotoId: number | undefined;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
  setImagePreview: (url: string | null) => void;
  setCurrentPhotoId: (id: number | undefined) => void;
}

export const useImageUpload = (options: UseImageUploadOptions = {}): UseImageUploadReturn => {
  const { maxSizeMB = 5, onError = toast.error } = options;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [currentPhotoId, setCurrentPhotoId] = useState<number | undefined>(undefined);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith('image/')) {
        onError('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        onError(`A imagem deve ter no máximo ${maxSizeMB}MB`);
        return;
      }

      setImageFile(file);
      setIsImageRemoved(false);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [maxSizeMB, onError]
  );

  const handleRemoveImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
    setIsImageRemoved(true);
  }, []);

  return {
    imageFile,
    imagePreview,
    isImageRemoved,
    currentPhotoId,
    handleImageChange,
    handleRemoveImage,
    setImagePreview,
    setCurrentPhotoId,
  };
};
