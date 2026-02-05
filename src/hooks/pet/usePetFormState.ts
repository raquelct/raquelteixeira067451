import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { petSchema, type PetFormSchema } from '../../schemas/petSchema';
import { useQuery } from '@tanstack/react-query';
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

  const { isLoading: isLoadingData } = useQuery({
    queryKey: ['pet', petId],
    queryFn: async () => {
      if (!petId) throw new Error('Pet ID is required');
      const pet = await petFacade.fetchPetById(petId);
      
      reset({
        nome: pet.name,
        raca: pet.breed,
        idade: pet.age,
      });

      onPetLoaded?.(pet);
      return pet;
    },
    enabled: isEditMode && !!petId,
    retry: false,
  });

  return {
    register,
    handleSubmit,
    errors,
    isLoadingData,
  };
};
