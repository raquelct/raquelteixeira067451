import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { petSchema, type PetFormSchema } from '../../schemas/petSchema';
import { useEntityLoader } from '../useEntityLoader';
import { petFacade } from '../../facades/pet.facade';
import type { Pet } from '../../types/pet.types';

interface UsePetFormStateProps {
  isEditMode: boolean;
  petId?: number;
  onPetLoaded?: (pet: Pet) => void;
}

export const usePetFormState = ({ isEditMode, petId, onPetLoaded }: UsePetFormStateProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PetFormSchema>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      nome: '',
      raca: '',
      idade: 0,
    },
  });

  const fetchPet = useCallback(async () => {
    if (!petId) throw new Error('Pet ID is required');
    return petFacade.fetchPetById(petId);
  }, [petId]);

  const { isLoading: isLoadingData } = useEntityLoader({
    fetcher: fetchPet,
    shouldFetch: isEditMode && !!petId,
    onSuccess: (pet) => {
      reset({
        nome: pet.name,
        raca: pet.breed,
        idade: pet.age,
      });

      onPetLoaded?.(pet);
    },
    errorMessage: 'Erro ao carregar dados do pet',
  });

  return {
    register,
    handleSubmit,
    errors,
    isLoadingData,
  };
};
