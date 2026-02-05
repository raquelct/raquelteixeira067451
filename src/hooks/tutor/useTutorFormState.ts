import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tutorSchema, type TutorFormSchema } from '../../schemas/tutorSchema';
import { useTutorFacade } from '../../facades/tutor.facade';
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

  const { useTutor } = useTutorFacade();
  const { data: tutor, isLoading: isLoadingData } = useTutor(tutorId);

  useEffect(() => {
    if (tutor && isEditMode) {
      reset({
        nome: tutor.name,
        email: tutor.email,
        telefone: maskPhone(tutor.phone),
        endereco: tutor.address,
        cpf: maskCPF(String(tutor.cpf)),
      });
      onTutorLoaded?.(tutor);
    }
  }, [tutor, isEditMode, reset]);

  return {
    register,
    handleSubmit,
    reset,
    setValue,
    errors,
    isLoadingData,
  };
};
