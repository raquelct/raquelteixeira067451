import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { petSchema, type PetFormSchema } from '../../schemas/petSchema';
import { usePetFacade } from '../../facades/pet.facade';
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

  const { usePet } = usePetFacade();
  const { data: pet, isLoading: isLoadingData } = usePet(petId);

  useEffect(() => {
    if (pet && isEditMode) {
      reset({
        nome: pet.name,
        raca: pet.breed,
        idade: pet.age,
      });
      onPetLoaded?.(pet);
    }
  }, [pet, isEditMode, reset]);

  return {
    register,
    handleSubmit,
    errors,
    isLoadingData,
  };
};
