import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tutorService } from '../services/tutor.service';
import type { TutorFormData, TutorFilters } from '../types/tutor.types';
import { TutorMapper } from '../domain/tutor/TutorMapper';
import { tutorSchema } from '../schemas/tutorSchema';
import { logger } from '../utils/logger';

export const useTutorFacade = () => {
  const queryClient = useQueryClient();

  const QUERY_KEYS = {
    all: ['tutors'] as const,
    list: (filters?: TutorFilters, page?: number, size?: number) => 
      [...QUERY_KEYS.all, 'list', { filters, page, size }] as const,
    detail: (id: number) => [...QUERY_KEYS.all, 'detail', id] as const,
  };

  const useTutors = (filters?: TutorFilters, page = 0, size = 10) => {
    return useQuery({
      queryKey: QUERY_KEYS.list(filters, page, size),
      queryFn: () => tutorService.getAll(filters, page, size),
      staleTime: 1000 * 60 * 5,
    });
  };

  const useTutor = (id?: number) => {
    return useQuery({
      queryKey: QUERY_KEYS.detail(id!),
      queryFn: () => tutorService.getById(id!),
      enabled: !!id,
    });
  };

  const createTutorMutation = useMutation({
    mutationFn: async (data: { 
      formData: TutorFormData; 
      imageFile?: File; 
      pendingPetIds?: number[] 
    }) => {
      tutorSchema.parse(data.formData);
      const normalizedData = TutorMapper.toCreateDto(data.formData);
      const createdTutor = await tutorService.create(normalizedData);

      if (data.imageFile) {
        await tutorService.uploadPhoto(createdTutor.id, data.imageFile).catch(err => {
          logger.error('Photo upload failed', { error: err.message });
        });
      }

      if (data.pendingPetIds?.length) {
        await Promise.all(
          data.pendingPetIds.map(petId => tutorService.linkPet(createdTutor.id, petId))
        ).catch(err => {
          logger.error('Pet linking failed', { error: err.message });
        });
      }
      return createdTutor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });

  const updateTutorMutation = useMutation({
    mutationFn: async (data: { 
      id: number; 
      formData: TutorFormData; 
      imageFile?: File; 
      isImageRemoved?: boolean; 
      currentPhotoId?: number; 
    }) => {
      tutorSchema.parse(data.formData);

      if (data.isImageRemoved && data.currentPhotoId) {
        await tutorService.deletePhoto(data.id, data.currentPhotoId).catch(err => {
          logger.error('Error removing old photo', { error: err.message });
        });
      }

      const normalizedData = TutorMapper.normalize(data.formData);
      const updatedTutor = await tutorService.update(data.id, normalizedData);

      if (data.imageFile) {
        await tutorService.uploadPhoto(updatedTutor.id, data.imageFile).catch(err => {
          logger.error('Error uploading new photo', { error: err.message });
        });
      }
      return updatedTutor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });

  const deleteTutorMutation = useMutation({
    mutationFn: (id: number) => tutorService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });

  const linkPetMutation = useMutation({
    mutationFn: (data: { tutorId: number; petId: number }) => 
      tutorService.linkPet(data.tutorId, data.petId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.tutorId) });
    }
  });

  const unlinkPetMutation = useMutation({
    mutationFn: (data: { tutorId: number; petId: number }) => 
      tutorService.unlinkPet(data.tutorId, data.petId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.tutorId) });
    }
  });

  return {
    useTutors,
    useTutor,
    createTutor: createTutorMutation.mutateAsync,
    updateTutor: updateTutorMutation.mutateAsync,
    deleteTutor: deleteTutorMutation.mutateAsync,
    linkPet: linkPetMutation.mutateAsync,
    unlinkPet: unlinkPetMutation.mutateAsync,
    isCreating: createTutorMutation.isPending,
    isUpdating: updateTutorMutation.isPending,
    isDeleting: deleteTutorMutation.isPending,
  };
};
