import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petService } from '../services/pet.service';
import type { PetFormData, PetFilters } from '../types/pet.types';
import { PetMapper } from '../domain/pet/PetMapper';
import { petSchema } from '../schemas/petSchema';
import { logger } from '../utils/logger';

export const usePetFacade = () => {
  const queryClient = useQueryClient();

  const QUERY_KEYS = {
    all: ['pets'] as const,
    list: (filters?: PetFilters, page?: number, size?: number) => 
      [...QUERY_KEYS.all, 'list', { filters, page, size }] as const,
    detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
  };

  const usePets = (filters?: PetFilters, page = 0, size = 10) => {
    return useQuery({
      queryKey: QUERY_KEYS.list(filters, page, size),
      queryFn: () => petService.getAll(filters, page, size),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  const usePet = (id?: number) => {
    return useQuery({
      queryKey: QUERY_KEYS.detail(id!),
      queryFn: () => petService.getById(id!),
      enabled: !!id,
    });
  };

  const createPetMutation = useMutation({
    mutationFn: async (data: { formData: PetFormData; imageFile?: File }) => {
      petSchema.parse(data.formData);
      const normalizedData = PetMapper.toCreateDto(data.formData);
      const createdPet = await petService.create(normalizedData);
      
      if (data.imageFile) {
        await petService.uploadPhoto(createdPet.id, data.imageFile);
      }
      return createdPet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });

  const updatePetMutation = useMutation({
    mutationFn: async (data: { 
      id: number; 
      formData: PetFormData; 
      imageFile?: File; 
      isImageRemoved?: boolean; 
      currentPhotoId?: number; 
    }) => {
      petSchema.parse(data.formData);
      
      if (data.isImageRemoved && data.currentPhotoId) {
        await petService.deletePhoto(data.id, data.currentPhotoId).catch(err => {
          logger.error('Error deleting photo', { error: err.message });
        });
      }

      const normalizedData = PetMapper.normalize(data.formData);
      const updatedPet = await petService.update(data.id, normalizedData);

      if (data.imageFile) {
        await petService.uploadPhoto(updatedPet.id, data.imageFile).catch(err => {
          logger.error('Error uploading photo', { error: err.message });
        });
      }

      return updatedPet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });

  const deletePetMutation = useMutation({
    mutationFn: (id: number) => petService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });

  return {
    usePets,
    usePet,
    createPet: createPetMutation.mutateAsync,
    updatePet: updatePetMutation.mutateAsync,
    deletePet: deletePetMutation.mutateAsync,
    isCreating: createPetMutation.isPending,
    isUpdating: updatePetMutation.isPending,
    isDeleting: deletePetMutation.isPending,
  };
};
