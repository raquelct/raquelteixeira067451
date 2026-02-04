import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { petSchema, type PetFormSchema } from '../schemas/petSchema';
import { petFacade } from '../facades/pet.facade';
import { useEntityLoader } from './useEntityLoader';
import { useImageUpload } from './useImageUpload';

export const usePetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return petFacade.fetchPetById(Number(id));
  }, [id]);

  const { isLoading: isLoadingData } = useEntityLoader({
    fetcher: fetchPet,
    shouldFetch: isEditMode && !!id,
    onSuccess: (pet) => {
      reset({
        nome: pet.name,
        raca: pet.breed,
        idade: pet.age,
      });

      if (pet.photoUrl) {
        setImagePreview(pet.photoUrl);
        if (pet.photoId) {
          setCurrentPhotoId(pet.photoId);
        }
      }
    },
    errorMessage: 'Erro ao carregar dados do pet',
  });

  const onSubmit = async (data: PetFormSchema) => {
    try {
      setIsSubmitting(true);

      if (isEditMode && id) {
        await petFacade.updatePet(
          Number(id),
          data,
          imageFile || undefined,
          isImageRemoved,
          currentPhotoId
        );
        toast.success('Pet atualizado com sucesso!');
      } else {
        await petFacade.createPet(data, imageFile || undefined);
        toast.success('Pet criado com sucesso!');
      }

      navigate('/');
    } catch (error) {
      console.error(`[PetForm] Erro ao ${isEditMode ? 'atualizar' : 'criar'} pet:`, error);
      toast.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} pet. Verifique os dados.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return {
    isEditMode,
    isLoadingData,
    isSubmitting,
    imagePreview,
    handleImageChange,
    handleRemoveImage,
    register,
    handleSubmit,
    errors,
    onSubmit,
    handleCancel,
  };
};
