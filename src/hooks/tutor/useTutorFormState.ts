import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tutorSchema, type TutorFormSchema } from '../../schemas/tutorSchema';
import { useQuery } from '@tanstack/react-query';
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

  const { isLoading: isLoadingData } = useQuery({
    queryKey: ['tutor', tutorId],
    queryFn: async () => {
      if (!tutorId) throw new Error('Tutor ID is required');
      const tutor = await tutorFacade.fetchTutorById(tutorId);
      
      reset({
        nome: tutor.name,
        email: tutor.email,
        telefone: maskPhone(tutor.phone),
        endereco: tutor.address,
        cpf: maskCPF(String(tutor.cpf)),
      });

      onTutorLoaded?.(tutor);
      return tutor;
    },
    enabled: isEditMode && !!tutorId,
    retry: false,
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
