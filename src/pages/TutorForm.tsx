import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { tutorSchema, type TutorFormSchema } from '../schemas/tutorSchema';
import { tutorFacade } from '../facades/tutor.facade';
import { useEntityLoader } from '../hooks/useEntityLoader';
import { useImageUpload } from '../hooks/useImageUpload';
import { LinkedPetsSection } from '../components/tutor/LinkedPetsSection';
import type { Tutor } from '../types/tutor.types';
import type { Pet } from '../types/pet.types';
import { maskCPF, maskPhone, unmask } from '../utils/masks';
import { FormInput } from '../components/shared/FormInput';
import { FormTextarea } from '../components/shared/FormTextarea';
import { ImageUpload } from '../components/shared/ImageUpload';
import { Button } from '../components/shared/Button';
import { toast } from 'react-hot-toast';
import { PetSelectModal } from '../components/shared/PetSelectModal';

export const TutorForm = () => {
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
      try {
        await tutorFacade.linkPetToTutor(Number(id), pet.id);
        handleAddPet(pet);
      } catch (error) {
        console.error('Erro ao vincular pet:', error);
        toast.error('Erro ao vincular pet');
      }
    } else {
      handleAddPet(pet);
      toast.success('Pet adicionado à lista');
    }
  };

  const onSubmit = async (data: TutorFormSchema) => {
    try {
      setIsSubmitting(true);

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

      navigate('/tutores');
    } catch (error) {
      console.error(`[TutorForm] Erro ao ${isEditMode ? 'atualizar' : 'criar'} tutor:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/tutores');
  };

  const linkedPetIds = isEditMode && currentTutor 
    ? currentTutor.pets?.map(p => p.id) || []
    : selectedPets.map(p => p.id);

  if (isLoadingData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-300 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded" />
                  <div className="h-12 bg-gray-200 rounded" />
                  <div className="h-12 bg-gray-200 rounded" />
                  <div className="h-32 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          {isEditMode ? 'Editar Tutor' : 'Cadastrar Novo Tutor'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode ? 'Atualize os dados do tutor abaixo' : 'Preencha os dados do tutor abaixo'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <ImageUpload
              label="Foto do Tutor"
              previewUrl={imagePreview}
              onImageSelect={handleImageChange}
              onRemove={handleRemoveImage}
            />

            <FormInput
              label="Nome Completo *"
              placeholder="Ex: João Silva"
              error={errors.nome?.message}
              {...register('nome')}
            />

            <FormInput
              label="Email *"
              placeholder="Ex: joao@email.com"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <FormInput
              label="Telefone *"
              placeholder="Ex: (65) 98765-4321"
              error={errors.telefone?.message}
              {...register('telefone')}
              maxLength={15}
              onChange={(e) => {
                const masked = maskPhone(e.target.value);
                setValue('telefone', masked);
              }}
            />

            <FormInput
              label="CPF *"
              placeholder="000.000.000-00"
              error={errors.cpf?.message}
              {...register('cpf')}
              maxLength={14}
              onChange={(e) => {
                const masked = maskCPF(e.target.value);
                setValue('cpf', masked);
              }}
            />

            <FormTextarea
              label="Endereço Completo *"
              placeholder="Ex: Rua das Flores, 123 - Centro, Cuiabá - MT"
              rows={3}
              error={errors.endereco?.message}
              {...register('endereco')}
            />

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isEditMode ? 'Atualizar Tutor' : 'Cadastrar Tutor'}
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

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            {isEditMode && currentTutor ? (
              <LinkedPetsSection
                mode="edit"
                tutor={currentTutor}
                selectedPets={selectedPets}
                onAddPet={handleAddPet}
                onRemovePet={handlePetUnlinked}
                onAddClick={() => setIsModalOpen(true)}
              />
            ) : (
              <LinkedPetsSection
                mode="create"
                selectedPets={selectedPets}
                onAddPet={handleAddPet}
                onRemovePet={handleRemovePet}
                onAddClick={() => setIsModalOpen(true)}
              />
            )}
          </div>
        </div>
      </div>

      <PetSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelectPet}
        alreadyLinkedPetIds={linkedPetIds}
      />
    </div>
  );
};
