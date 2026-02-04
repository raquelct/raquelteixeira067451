import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tutorSchema, type TutorFormSchema } from '../../schemas/tutorSchema';
import { useEntityLoader } from '../useEntityLoader';
import { tutorFacade } from '../../facades/tutor.facade';
import { maskPhone, maskCPF } from '../../utils/masks';
import type { Tutor } from '../../types/tutor.types';

interface UseTutorFormStateProps {
  isEditMode: boolean;
  tutorId?: number;
  onTutorLoaded?: (tutor: Tutor) => void;
}

export const useTutorFormState = ({ isEditMode, tutorId, onTutorLoaded }: UseTutorFormStateProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TutorFormSchema>({
    resolver: zodResolver(tutorSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      endereco: '',
      cpf: '',
    },
  });

  const fetchTutor = useCallback(async () => {
    if (!tutorId) throw new Error('Tutor ID is required');
    return tutorFacade.fetchTutorById(tutorId);
  }, [tutorId]);

  const { isLoading: isLoadingData } = useEntityLoader({
    fetcher: fetchTutor,
    shouldFetch: isEditMode && !!tutorId,
    onSuccess: (tutor) => {
      reset({
        nome: tutor.name,
        email: tutor.email,
        telefone: maskPhone(tutor.phone),
        endereco: tutor.address,
        cpf: maskCPF(String(tutor.cpf)),
      });

      onTutorLoaded?.(tutor);
    },
    errorMessage: 'Erro ao carregar dados do tutor',
  });

  return {
    register,
    handleSubmit,
    reset,
    setValue,
    errors,
    isLoadingData,
  };
};
