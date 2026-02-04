import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { petFacade } from '../../facades/pet.facade';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const onSubmit = useCallback(async (data: PetFormSchema) => {
    setIsSubmitting(true);

    try {
      if (isEditMode && petId) {
        await petFacade.updatePet(
          petId,
          data,
          imageFile || undefined,
          isImageRemoved,
          currentPhotoId
        );
        toast.success('Pet atualizado com sucesso!');
      } else {
        await petFacade.createPet(data, imageFile || undefined);
        toast.success('Pet criado com sucesso!');
      }

      navigate('/');
    } finally {
      setIsSubmitting(false);
    }
  }, [isEditMode, petId, imageFile, isImageRemoved, currentPhotoId, navigate]);

  return {
    isSubmitting,
    onSubmit,
    handleCancel,
  };
};
