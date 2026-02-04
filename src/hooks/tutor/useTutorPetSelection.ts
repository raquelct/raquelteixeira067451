import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { tutorFacade } from '../../facades/tutor.facade';
import type { Pet } from '../../types/pet.types';

interface UseTutorPetSelectionProps {
  isEditMode: boolean;
  tutorId?: number;
}

export const useTutorPetSelection = ({ isEditMode, tutorId }: UseTutorPetSelectionProps) => {
  const [selectedPets, setSelectedPets] = useState<Pet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddPet = useCallback((pet: Pet) => {
    setSelectedPets((prev) => [...prev, pet]);
    toast.success('Pet adicionado à lista!');
  }, []);

  const handleRemovePet = useCallback((petId: number) => {
    setSelectedPets((prev) => prev.filter((p) => p.id !== petId));
    toast.success('Pet removido da lista!');
  }, []);

  const handlePetUnlinked = useCallback((petId: number) => {
    setSelectedPets((prev) => prev.filter((p) => p.id !== petId));
    toast.success('Vínculo removido com sucesso!');
  }, []);

  const handleSelectPet = useCallback(async (pet: Pet) => {
    if (isEditMode && tutorId) {
      await tutorFacade.linkPetToTutor(tutorId, pet.id);
      handleAddPet(pet);
    } else {
      handleAddPet(pet);
    }
  }, [isEditMode, tutorId, handleAddPet]);

  return {
    selectedPets,
    setSelectedPets,
    isModalOpen,
    setIsModalOpen,
    handleAddPet,
    handleRemovePet,
    handlePetUnlinked,
    handleSelectPet,
  };
};
