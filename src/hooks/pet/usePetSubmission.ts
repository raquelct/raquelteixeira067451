import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { usePetFacade } from '../../facades/pet.facade';
import type { PetFormSchema } from '../../schemas/petSchema';

interface UsePetSubmissionProps {
  isEditMode: boolean;
  petId?: number;
  imageFile: File | null;
  isImageRemoved: boolean;
  currentPhotoId?: number;
}

export const usePetSubmission = ({
  isEditMode,
  petId,
  imageFile,
  isImageRemoved,
  currentPhotoId,
}: UsePetSubmissionProps) => {
  const navigate = useNavigate();
  const { createPet, updatePet, isCreating, isUpdating } = usePetFacade();
  
  const isSubmitting = isCreating || isUpdating;

  const handleCancel = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const onSubmit = useCallback(async (data: PetFormSchema) => {
    try {
      if (isEditMode && petId) {
        await updatePet({
          id: petId,
          formData: data,
          imageFile: imageFile || undefined,
          isImageRemoved,
          currentPhotoId
        });
        toast.success('Pet atualizado com sucesso!');
      } else {
        await createPet({ formData: data, imageFile: imageFile || undefined });
        toast.success('Pet criado com sucesso!');
      }

      navigate('/');
    } catch (error) {
       // Error handled globally or by Facade
       console.error(error);
    }
  }, [isEditMode, petId, imageFile, isImageRemoved, currentPhotoId, navigate, createPet, updatePet]);

  return {
    isSubmitting,
    onSubmit,
    handleCancel,
  };
};
