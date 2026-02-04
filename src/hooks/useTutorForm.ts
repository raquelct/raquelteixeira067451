import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { tutorSchema, type TutorFormSchema } from '../schemas/tutorSchema';
import { tutorFacade } from '../facades/tutor.facade';
import { useEntityLoader } from './useEntityLoader';
import { useImageUpload } from './useImageUpload';
import { maskPhone, maskCPF, unmask } from '../utils/masks';
import type { Tutor } from '../types/tutor.types';
import type { Pet } from '../types/pet.types';

export const useTutorForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTutor, setCurrentTutor] = useState<Tutor | null>(null);
  const [selectedPets, setSelectedPets] = useState<Pet[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    return tutorFacade.fetchTutorById(Number(id));
  }, [id]);

  const { isLoading: isLoadingData } = useEntityLoader({
    fetcher: fetchTutor,
    shouldFetch: isEditMode && !!id,
    onSuccess: (tutor) => {
      setCurrentTutor(tutor);
      reset({
        nome: tutor.name,
        email: tutor.email,
        telefone: maskPhone(tutor.phone),
        endereco: tutor.address,
        cpf: maskCPF(String(tutor.cpf)),
      });

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
    errorMessage: 'Erro ao carregar dados do tutor',
  });

  const handleCancel = () => {
    navigate('/tutores');
  };

  const handleAddPet = (pet: Pet) => {
    setSelectedPets((prev) => [...prev, pet]);
    toast.success('Pet adicionado à lista!');
  };

  const handleRemovePet = (petId: number) => {
    setSelectedPets((prev) => prev.filter((p) => p.id !== petId));
    toast.success('Pet removido da lista!');
  };

  const handlePetUnlinked = (petId: number) => {
    setSelectedPets((prev) => prev.filter((p) => p.id !== petId));
    toast.success('Vínculo removido com sucesso!');
  };

  const handleSelectPet = async (pet: Pet) => {
    if (isEditMode && id) {
      await tutorFacade.linkPetToTutor(Number(id), pet.id);
      handleAddPet(pet);
    } else {
      handleAddPet(pet);
    }
  };

  const onSubmit = async (data: TutorFormSchema) => {
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        cpf: unmask(data.cpf),
        telefone: unmask(data.telefone),
      };

      if (isEditMode && id) {
        await tutorFacade.updateTutor(
          Number(id),
          payload,
          imageFile || undefined,
          isImageRemoved,
          currentPhotoId
        );
      } else {
        const petIds = selectedPets.map((pet) => pet.id);
        await tutorFacade.createTutor(payload, imageFile || undefined, petIds);
      }

      toast.success(isEditMode ? 'Tutor atualizado com sucesso!' : 'Tutor cadastrado com sucesso!');
      navigate('/tutores');
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkedPetIds = isEditMode && currentTutor
    ? currentTutor.pets?.map(p => p.id) || []
    : selectedPets.map(p => p.id);

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
