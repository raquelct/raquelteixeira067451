import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTutorFacade } from '../../facades/tutor.facade';
import type { TutorFormSchema } from '../../schemas/tutorSchema';
import type { Pet } from '../../types/pet.types';

interface UseTutorSubmissionProps {
  isEditMode: boolean;
  tutorId?: number;
  selectedPets: Pet[];
  imageFile: File | null;
  isImageRemoved: boolean;
  currentPhotoId?: number;
}

export const useTutorSubmission = ({
  isEditMode,
  tutorId,
  selectedPets,
  imageFile,
  isImageRemoved,
  currentPhotoId,
}: UseTutorSubmissionProps) => {
  const navigate = useNavigate();
  const { createTutor, updateTutor, isCreating, isUpdating } = useTutorFacade();
  
  const isSubmitting = isCreating || isUpdating;

  const handleCancel = useCallback(() => {
    navigate('/tutores');
  }, [navigate]);

  const onSubmit = useCallback(async (data: TutorFormSchema) => {
    try {
      if (isEditMode && tutorId) {
        await updateTutor({
          id: tutorId,
          formData: data,
          imageFile: imageFile || undefined,
          isImageRemoved,
          currentPhotoId
        });
      } else {
        const petIds = selectedPets.map((pet) => pet.id);
        await createTutor({
          formData: data, 
          imageFile: imageFile || undefined, 
          pendingPetIds: petIds
        });
      }

      toast.success(isEditMode ? 'Tutor atualizado com sucesso!' : 'Tutor cadastrado com sucesso!');
      navigate('/tutores');
    } catch (error) {
      console.error(error);
    }
  }, [isEditMode, tutorId, selectedPets, imageFile, isImageRemoved, currentPhotoId, navigate, createTutor, updateTutor]);

  return {
    isSubmitting,
    onSubmit,
    handleCancel,
  };
};
