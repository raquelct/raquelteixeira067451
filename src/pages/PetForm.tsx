import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { petSchema, type PetFormSchema } from '../schemas/petSchema';
import { petFacade } from '../facades/pet.facade';
import { useEntityLoader } from '../hooks/useEntityLoader';
import { FormInput } from '../components/shared/FormInput';
import { ImageUpload } from '../components/shared/ImageUpload';
import { Button } from '../components/shared/Button';
import { toast } from 'react-hot-toast';

export const PetForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [currentPhotoId, setCurrentPhotoId] = useState<number | undefined>(undefined);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }

      setImageFile(file);
      setIsImageRemoved(false);

      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (isEditMode) {
      setIsImageRemoved(true);
    }
  };

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
        console.log('[PetForm] Pet atualizado com sucesso');
      } else {
        await petFacade.createPet(data, imageFile || undefined);
        console.log('[PetForm] Pet criado com sucesso');
      }

      navigate('/');
    } catch (error) {
      console.error(`[PetForm] Erro ao ${isEditMode ? 'atualizar' : 'criar'} pet:`, error);
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
      <div className="mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Editar Pet' : 'Cadastrar Novo Pet'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode ? 'Atualize os dados do pet abaixo' : 'Preencha os dados do pet abaixo'}
        </p>
      </div>

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

        <div className="flex space-x-4 pt-4">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditMode ? 'Atualizar Pet' : 'Cadastrar Pet'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
