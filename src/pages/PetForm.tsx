import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { petSchema, type PetFormSchema } from '../schemas/petSchema';
import { petFacade } from '../facades/pet.facade';
import { useEntityLoader } from '../hooks/useEntityLoader';
import { useImageUpload } from '../hooks/useImageUpload';
import { FormInput } from '../components/shared/FormInput';
import { ImageUpload } from '../components/shared/ImageUpload';
import { toast } from 'react-hot-toast';
import { FormHeader } from '../components/shared/FormHeader';
import { FormActions } from '../components/shared/FormActions';

export const PetForm = () => {
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
      console.log('[PetForm] Dados carregados:', pet);
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

      console.log(`[PetForm] ${isEditMode ? 'Atualizando' : 'Criando'} pet:`, data);

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

  if (isLoadingData) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <FormHeader
        title={isEditMode ? 'Editar Pet' : 'Cadastrar Novo Pet'}
        subtitle={isEditMode ? 'Atualize os dados do pet abaixo' : 'Preencha os dados do pet abaixo'}
        onBack={handleCancel}
      />

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <ImageUpload
          label="Foto do Pet"
          previewUrl={imagePreview}
          onImageSelect={handleImageChange}
          onRemove={handleRemoveImage}
        />

        <FormInput
          label="Nome do Pet *"
          placeholder="Ex: Bob"
          error={errors.nome?.message}
          {...register('nome')}
        />

        <FormInput
          label="Raça"
          placeholder="Ex: Labrador"
          error={errors.raca?.message}
          {...register('raca')}
        />

        <FormInput
          label="Idade (anos)"
          placeholder="Ex: 3"
          type="number"
          min="0"
          error={errors.idade?.message}
          {...register('idade', { valueAsNumber: true })}
        />

        <FormActions
          submitLabel={isEditMode ? 'Atualizar Pet' : 'Cadastrar Pet'}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
        />
      </form>
    </div>
  );
};
