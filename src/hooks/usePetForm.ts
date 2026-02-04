import { useParams } from 'react-router-dom';
import { useImageUpload } from './useImageUpload';
import { usePetFormState } from './pet/usePetFormState';
import { usePetSubmission } from './pet/usePetSubmission';

export const usePetForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const petId = id ? Number(id) : undefined;

  const {
    imageFile,
    imagePreview,
    isImageRemoved,
    currentPhotoId,
    handleImageChange,
    handleRemoveImage,
    setImagePreview,
    setCurrentPhotoId,
  } = useImageUpload({ maxSizeMB: 5 });

  const {
    register,
    handleSubmit,
    errors,
    isLoadingData,
  } = usePetFormState({
    isEditMode,
    petId,
    onPetLoaded: (pet) => {
      if (pet.photoUrl) {
        setImagePreview(pet.photoUrl);
        if (pet.photoId) {
          setCurrentPhotoId(pet.photoId);
        }
      }
    },
  });

  const { isSubmitting, onSubmit, handleCancel } = usePetSubmission({
    isEditMode,
    petId,
    imageFile,
    isImageRemoved,
    currentPhotoId,
  });

  return {
    isEditMode,
    isLoadingData,
    isSubmitting,
    imagePreview,
    handleImageChange,
    handleRemoveImage,
    register,
    handleSubmit,
    errors,
    onSubmit,
    handleCancel,
  };
};
