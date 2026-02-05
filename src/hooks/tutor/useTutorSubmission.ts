import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { tutorFacade } from '../../facades/tutor.facade';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCancel = useCallback(() => {
    navigate('/tutores');
  }, [navigate]);

  const onSubmit = useCallback(async (data: TutorFormSchema) => {
    setIsSubmitting(true);

    try {
      const payload = data;

      if (isEditMode && tutorId) {
        await tutorFacade.updateTutor(
          tutorId,
          payload,
          imageFile || undefined,
          isImageRemoved,
          currentPhotoId
        );
      } else {
        const petIds = selectedPets.map((pet) => pet.id);
        await tutorFacade.createTutor(payload, imageFile || undefined, petIds);
      }

      toast.success(isEditMode ? 'Tutor atualizado com sucesso!' : 'Tutor cadastrado com sucesso!');
      navigate('/tutores');
    } finally {
      setIsSubmitting(false);
    }
  }, [isEditMode, tutorId, selectedPets, imageFile, isImageRemoved, currentPhotoId, navigate]);

  return {
    isSubmitting,
    onSubmit,
    handleCancel,
  };
};
