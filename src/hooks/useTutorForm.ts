import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useImageUpload } from './useImageUpload';
import { useTutorFormState } from './tutor/useTutorFormState';
import { useTutorPetSelection } from './tutor/useTutorPetSelection';
import { useTutorSubmission } from './tutor/useTutorSubmission';
import type { Tutor } from '../types/tutor.types';

export const useTutorForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const tutorId = id ? Number(id) : undefined;

  const [currentTutor, setCurrentTutor] = useState<Tutor | null>(null);

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
    selectedPets,
    setSelectedPets,
    isModalOpen,
    setIsModalOpen,
    handleAddPet,
    handleRemovePet,
    handlePetUnlinked,
    handleSelectPet,
  } = useTutorPetSelection({ isEditMode, tutorId });

  const {
    register,
    handleSubmit,
    setValue,
    errors,
    isLoadingData,
  } = useTutorFormState({
    isEditMode,
    tutorId,
    onTutorLoaded: (tutor) => {
      setCurrentTutor(tutor);

      if (tutor.foto?.url) {
        setImagePreview(tutor.foto.url);
        if (tutor.foto.id) {
          setCurrentPhotoId(tutor.foto.id);
        }
      }

      if (tutor.pets) {
        setSelectedPets(tutor.pets);
      }
    },
  });

  const { isSubmitting, onSubmit, handleCancel } = useTutorSubmission({
    isEditMode,
    tutorId,
    selectedPets,
    imageFile,
    isImageRemoved,
    currentPhotoId,
  });

  const linkedPetIds = selectedPets.map(p => p.id);

  return {
    isEditMode,
    isLoadingData,
    isSubmitting,
    currentTutor,
    selectedPets,
    isModalOpen,
    setIsModalOpen,
    imagePreview,
    handleImageChange,
    handleRemoveImage,
    register,
    handleSubmit,
    errors,
    setValue,
    onSubmit,
    handleCancel,
    handleAddPet,
    handleRemovePet,
    handlePetUnlinked,
    handleSelectPet,
    linkedPetIds,
  };
};
